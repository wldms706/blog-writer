import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// 인스타 캡션 무료 횟수 추가 쿠폰
const CAPTION_COUPONS: Record<string, number> = {
  INSTA10: 5, // 기본 5회 + 5회 = 총 10회
};

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  try {
    const { code } = await request.json();
    const couponCode = typeof code === 'string' ? code.trim().toUpperCase() : '';

    const bonus = CAPTION_COUPONS[couponCode];
    if (!bonus) {
      return NextResponse.json({ error: '유효하지 않은 쿠폰 코드입니다.' }, { status: 400 });
    }

    // 이미 쿠폰 쓴 사람인지 확인
    const { data: profile } = await supabase
      .from('profiles')
      .select('caption_bonus')
      .eq('id', user.id)
      .single();

    if ((profile?.caption_bonus || 0) >= bonus) {
      return NextResponse.json({ error: '이미 적용된 쿠폰입니다.' }, { status: 400 });
    }

    const { error } = await supabase
      .from('profiles')
      .update({ caption_bonus: bonus })
      .eq('id', user.id);

    if (error) {
      return NextResponse.json({ error: '쿠폰 적용에 실패했습니다.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, bonus, totalFree: 5 + bonus });
  } catch {
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
