import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

// EAZY 릴스 강의 등 외부 상품 구매 시 발급된 쿠폰을 등록해 블로그라이터 PRO 활성화
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

    // 소유자 확인 (공유 방지 핵심)
    if (coupon.user_id && coupon.user_id !== user.id) {
      return NextResponse.json({
        error: '이 쿠폰은 다른 원장님 계정 전용이에요. 릴스 강의를 결제하신 계정으로 로그인해주세요.',
      }, { status: 403 });
    }

    // 이미 사용됨
    if (coupon.status === 'used') {
      return NextResponse.json({ error: '이미 등록된 쿠폰이에요.' }, { status: 400 });
    }

    // 이미 만료됨
    if (coupon.status === 'expired') {
      return NextResponse.json({ error: '만료된 쿠폰이에요.' }, { status: 400 });
    }

    // 사용 처리 + 만료일 설정
    const now = new Date();
    const expiresAt = new Date(now.getTime() + (coupon.duration_days || 30) * 24 * 60 * 60 * 1000);

    const { error: updateErr } = await admin
      .from('coupons')
      .update({
        status: 'used',
        used_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
        user_id: user.id, // 최초 사용자에 귀속 (user_id 없이 발급된 케이스 대응)
      })
      .eq('id', coupon.id);

    if (updateErr) {
      console.error('쿠폰 상태 업데이트 실패:', updateErr);
      return NextResponse.json({ error: '쿠폰 처리 중 오류가 났어요. 다시 시도해주세요.' }, { status: 500 });
    }

    // profiles.plan 업데이트 → 유료 활성화
    const targetPlan = coupon.target_plan || 'pro_reels';
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
      await admin.from('subscriptions').insert({
        user_id: user.id,
        status: 'active',
        next_billing_at: expiresAt.toISOString(),
        plan: targetPlan,
        source: 'coupon',
        source_code: inputCode,
      });
    } catch (subErr) {
      // subscriptions 테이블 스키마가 다르면 무시 (profile.plan만으로도 동작)
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
