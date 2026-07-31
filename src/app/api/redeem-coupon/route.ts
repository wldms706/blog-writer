import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

// EAZY 릴스 강의 / 라이브 강의 등 외부 상품 구매/참여 시 발급된 쿠폰으로 PRO 활성화
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  try {
    const { code } = await request.json();
    const inputCode = typeof code === 'string' ? code.trim().toUpperCase() : '';

    if (!inputCode) {
      return NextResponse.json({ error: '쿠폰 코드를 입력해주세요.' }, { status: 400 });
    }

    const admin = createAdminClient();

    // 쿠폰 조회
    const { data: coupon, error: fetchErr } = await admin
      .from('coupons')
      .select('*')
      .eq('code', inputCode)
      .maybeSingle();

    if (fetchErr) {
      console.error('쿠폰 조회 실패:', fetchErr);
      return NextResponse.json({ error: '쿠폰 조회에 실패했어요. 다시 시도해주세요.' }, { status: 500 });
    }

    if (!coupon) {
      return NextResponse.json({ error: '존재하지 않는 쿠폰 코드예요. 다시 확인해주세요.' }, { status: 400 });
    }

    const maxUses = coupon.max_uses || 1;
    const usedCount = coupon.used_count || 0;
    const isSharedCode = maxUses > 1;

    // 등록 마감일 체크
    if (coupon.redemption_deadline && new Date(coupon.redemption_deadline) < new Date()) {
      return NextResponse.json({ error: '쿠폰 등록 기간이 만료됐어요.' }, { status: 400 });
    }

    // 단일 사용 쿠폰(기존 릴스 강의) — 원래 로직 유지
    if (!isSharedCode) {
      // 소유자 확인
      if (coupon.user_id && coupon.user_id !== user.id) {
        return NextResponse.json({
          error: '이 쿠폰은 다른 원장님 계정 전용이에요.',
        }, { status: 403 });
      }
      if (coupon.status === 'used') {
        return NextResponse.json({ error: '이미 등록된 쿠폰이에요.' }, { status: 400 });
      }
      if (coupon.status === 'expired') {
        return NextResponse.json({ error: '만료된 쿠폰이에요.' }, { status: 400 });
      }
    }

    // 공용 쿠폰(라이브 강의 등) — 여러 명 사용 가능
    if (isSharedCode) {
      // 이미 사용자가 등록했는지 확인
      const { data: existing } = await admin
        .from('coupon_redemptions')
        .select('id')
        .eq('coupon_id', coupon.id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) {
        return NextResponse.json({
          error: '이 쿠폰은 이미 등록하셨어요.',
        }, { status: 400 });
      }

      // 정원 마감 확인
      if (usedCount >= maxUses) {
        return NextResponse.json({
          error: `쿠폰 정원(${maxUses}명)이 다 찼어요.`,
        }, { status: 400 });
      }
    }

    // 사용 처리
    const now = new Date();
    const expiresAt = new Date(now.getTime() + (coupon.duration_days || 30) * 24 * 60 * 60 * 1000);
    const targetPlan = coupon.target_plan || 'pro_permanent';

    // ── 권한 부여를 먼저 한다 ──
    // 쿠폰을 먼저 소각하면, 권한 부여가 실패했을 때 쿠폰만 날아가고 재등록도 막혀
    // 사용자가 빠져나올 수 없는 상태가 된다(실제 발생: 2026-07 릴스 쿠폰 3건).
    //
    // profiles.plan 은 'free' | 'paid' 만 허용된다(profiles_plan_check).
    // 과거 코드는 여기에 'pro_reels' / 'pro_permanent' 를 넣어 UPDATE 가 통째로 거부됐고,
    // 결과를 확인하지 않아 사용자에게는 성공으로 표시됐다.
    // 결제 경로(payments/confirm, upgrade, usage.ts)와 동일하게 'paid' 를 쓰고,
    // 세부 플랜은 plan_type 에 보존한다.
    const { error: grantErr } = await admin
      .from('profiles')
      .update({
        plan: 'paid',
        plan_type: targetPlan,
        coupon_used: true,
        coupon_code: inputCode,
      })
      .eq('id', user.id);

    if (grantErr) {
      console.error('쿠폰 권한 부여 실패 (쿠폰은 소각하지 않음):', grantErr);
      return NextResponse.json(
        { error: '이용권 활성화에 실패했어요. 쿠폰은 그대로 남아있으니 다시 시도해주세요.' },
        { status: 500 },
      );
    }

    if (isSharedCode) {
      // 공용 쿠폰: coupon_redemptions에 기록 + used_count 증가
      const { error: redemptionErr } = await admin
        .from('coupon_redemptions')
        .insert({
          coupon_id: coupon.id,
          user_id: user.id,
        });

      if (redemptionErr) {
        console.error('coupon_redemptions 삽입 실패:', redemptionErr);
        return NextResponse.json({ error: '쿠폰 처리 중 오류가 났어요.' }, { status: 500 });
      }

      // used_count 증가
      await admin
        .from('coupons')
        .update({ used_count: usedCount + 1 })
        .eq('id', coupon.id);
    } else {
      // 단일 쿠폰: 기존 로직 — status = used로 변경
      const { error: updateErr } = await admin
        .from('coupons')
        .update({
          status: 'used',
          used_at: now.toISOString(),
          expires_at: expiresAt.toISOString(),
          user_id: user.id,
        })
        .eq('id', coupon.id);

      if (updateErr) {
        console.error('쿠폰 상태 업데이트 실패:', updateErr);
        return NextResponse.json({ error: '쿠폰 처리 중 오류가 났어요.' }, { status: 500 });
      }
    }

    // subscriptions 테이블에도 임시 구독 기록 (만료 관리용)
    // user_id 에 UNIQUE 제약이 있어 단순 insert 는 기존 구독이 있는 사용자에게 실패한다.
    // supabase-js 는 throw 하지 않고 { error } 를 반환하므로 try/catch 로는 잡히지 않는다.
    const planName = targetPlan === 'pro_permanent' ? '프로 (반영구) - 쿠폰'
                   : targetPlan === 'pro_general' ? '프로 (일반) - 쿠폰'
                   : `${targetPlan} - 쿠폰`;
    const subRow = {
      user_id: user.id,
      status: 'active',
      plan_id: targetPlan,
      plan_name: planName,
      plan_type: targetPlan === 'pro_permanent' ? 'permanent' : 'general',
      price: 0,
      started_at: now.toISOString(),
      next_billing_at: expiresAt.toISOString(),
      payment_key: 'coupon_grant',
      order_id: `coupon_${inputCode}_${user.id}`,
      customer_key: `coupon_${user.id}`,
    };

    const { data: existingSub } = await admin
      .from('subscriptions')
      .select('id, status, price, next_billing_at')
      .eq('user_id', user.id)
      .maybeSingle();

    const hasLiveSub = existingSub && (
      existingSub.status === 'active' ||
      (existingSub.next_billing_at && new Date(existingSub.next_billing_at) > now)
    );

    if (hasLiveSub && existingSub.price > 0) {
      // 유료 결제 중인 구독은 덮어쓰지 않는다 (빌링키가 날아가 결제가 끊긴다)
      console.warn(`쿠폰 등록: 유료 구독 유지, 구독 행 미변경 user=${user.id}`);
    } else {
      const { error: subErr } = existingSub
        ? await admin.from('subscriptions').update(subRow).eq('id', existingSub.id)
        : await admin.from('subscriptions').insert(subRow);

      if (subErr) {
        // 권한(profiles.plan)은 이미 부여됐으므로 이용에는 지장이 없다. 만료 관리만 누락된다.
        console.error('쿠폰 구독 기록 실패 (권한은 부여됨):', subErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: '블로그라이터 PRO 한 달 이용권이 활성화됐어요! 🎉',
      expiresAt: expiresAt.toISOString(),
      targetPlan,
    });
  } catch (err) {
    console.error('쿠폰 등록 처리 오류:', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : '서버 오류가 발생했어요.' }, { status: 500 });
  }
}

// 쿠폰 정보 조회 (등록 마감 카운트다운용)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: '코드가 필요해요.' }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: coupon } = await admin
    .from('coupons')
    .select('code, max_uses, used_count, redemption_deadline, duration_days')
    .eq('code', code.trim().toUpperCase())
    .maybeSingle();

  if (!coupon) {
    return NextResponse.json({ error: '쿠폰 없음' }, { status: 404 });
  }

  return NextResponse.json({
    code: coupon.code,
    maxUses: coupon.max_uses,
    usedCount: coupon.used_count,
    remaining: Math.max(0, (coupon.max_uses || 1) - (coupon.used_count || 0)),
    deadline: coupon.redemption_deadline,
    durationDays: coupon.duration_days,
  });
}
