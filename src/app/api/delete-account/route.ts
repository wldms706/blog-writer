import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  const admin = createAdminClient();
  const userId = user.id;

  try {
    // 1. 히스토리 삭제
    await admin.from('histories').delete().eq('user_id', userId);

    // 2. 설정 삭제
    await admin.from('settings').delete().eq('user_id', userId);

    // 3. 구독 삭제
    await admin.from('subscriptions').delete().eq('user_id', userId);

    // 4. 프로필 삭제
    await admin.from('profiles').delete().eq('id', userId);

    // 5. Auth 유저 삭제
    await admin.auth.admin.deleteUser(userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete account error:', error);
    return NextResponse.json({ error: '탈퇴 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
