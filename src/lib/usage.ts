import { createClient as createServerSupabase } from '@/lib/supabase/server';

const FREE_DAILY_LIMIT = 3;

export async function checkAndIncrementUsage(userId: string): Promise<{
  allowed: boolean;
  remaining: number;
  plan: string;
}> {
  const supabase = await createServerSupabase();
  const today = new Date().toISOString().split('T')[0];

  // 프로필 조회
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, daily_usage, last_usage_date')
    .eq('id', userId)
    .single();

  if (!profile) {
    return { allowed: false, remaining: 0, plan: 'free' };
  }

  // 유료 유저는 무제한
  if (profile.plan === 'paid') {
    await supabase
      .from('profiles')
      .update({
        daily_usage: (profile.last_usage_date === today ? profile.daily_usage : 0) + 1,
        last_usage_date: today,
      })
      .eq('id', userId);

    return { allowed: true, remaining: -1, plan: 'paid' };
  }

  // 무료 유저: 날짜가 바뀌면 리셋
  const currentUsage = profile.last_usage_date === today ? profile.daily_usage : 0;

  if (currentUsage >= FREE_DAILY_LIMIT) {
    return { allowed: false, remaining: 0, plan: 'free' };
  }

  // 사용량 증가
  await supabase
    .from('profiles')
    .update({
      daily_usage: currentUsage + 1,
      last_usage_date: today,
    })
    .eq('id', userId);

  return {
    allowed: true,
    remaining: FREE_DAILY_LIMIT - currentUsage - 1,
    plan: 'free',
  };
}
