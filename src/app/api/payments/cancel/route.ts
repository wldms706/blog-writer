import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  try {
    // 구독 상태: cancelled로 변경 + 빌링키 제거 (자동결제 중단)
    // 단, next_billing_at까지는 플랜 유지 (즉시 무료 전환 안 함)
    const { error: subError } = await supabase
      .from('subscriptions')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        billing_key: null,
      })
      .eq('user_id', user.id);

    if (subError) {
      console.error('구독 취소 실패:', subError);
      return NextResponse.json({ error: '구독 취소에 실패했습니다.' }, { status: 500 });
    }

    // 프로필은 변경하지 않음 — next_billing_at 만료 시 크론에서 free로 전환

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Cancel error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
