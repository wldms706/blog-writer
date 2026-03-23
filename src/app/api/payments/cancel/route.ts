import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  try {
    // 구독 상태 업데이트
    const { error: subError } = await supabase
      .from('subscriptions')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    if (subError) {
      console.error('구독 취소 실패:', subError);
      return NextResponse.json({ error: '구독 취소에 실패했습니다.' }, { status: 500 });
    }

    // 프로필 플랜을 free로 변경
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ plan: 'free' })
      .eq('id', user.id);

    if (profileError) {
      console.error('프로필 업데이트 실패:', profileError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Cancel error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
