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

    // profiles.plan 업데이트 → 유료 활성화
    const targetPlan = coupon.target_plan || 'pro_permanent';
    await admin
      .from('profiles')
      .update({
        plan: targetPlan,
        coupon_used: true,
        coupon_code: inputCode,
      })
      .eq('id', user.id);

    // subscriptions 테이블에도 임시 구독 삽입 (만료 관리용)
    try {
      const planName = targetPlan === 'pro_permanent' ? '프로 (반영구) - 쿠폰'
                     : targetPlan === 'pro_general' ? '프로 (일반) - 쿠폰'
                     : `${targetPlan} - 쿠폰`;
      await admin.from('subscriptions').insert({
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
      });
    } catch (subErr) {
      console.warn('subscriptions 삽입 실패 (무시 가능):', subErr);
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
