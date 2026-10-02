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

    // One database transaction: failures roll back coupon, entitlement and expiry together.
    const { data, error } = await admin.rpc('redeem_coupon_atomic', {
      p_user_id: user.id,
      p_code: inputCode,
    });
    if (error || !data) {
      console.error('쿠폰 등록 트랜잭션 실패:', error);
      return NextResponse.json({ error: '쿠폰 등록에 실패했어요. 쿠폰은 사용되지 않았으니 다시 시도해주세요.' }, { status: 500 });
    }
    if (data.error) {
      return NextResponse.json({ error: data.error }, { status: data.status || 400 });
    }
    return NextResponse.json(data);
  } catch (err) {
    console.error('쿠폰 등록 처리 오류:', err);
    return NextResponse.json({ error: '서버 오류가 발생했어요.' }, { status: 500 });
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
