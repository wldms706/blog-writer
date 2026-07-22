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

    // caption_bonus 컬럼이 아직 DB에 없어서 쿠폰 기능 임시 비활성화
    return NextResponse.json(
      { error: '쿠폰 기능 준비 중이에요. 조금만 기다려주세요!', bonus },
      { status: 503 },
    );
  } catch {
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
