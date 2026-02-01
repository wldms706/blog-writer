import { createClient as createServerSupabase } from '@/lib/supabase/server';
import { syncUserToSheet } from '@/lib/google-sheets';

const FREE_DAILY_LIMIT = 999; // 임시로 제한 해제

// 관리자 이메일 - 무제한 사용 가능
const ADMIN_EMAILS = ['wldms706@naver.com'];

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
    .select('email, plan, daily_usage, total_usage, last_usage_date, created_at, coupon_used, coupon_code')
    .eq('id', userId)
    .single();

  if (!profile) {
    return { allowed: false, remaining: 0, plan: 'free' };
  }

  const currentDailyUsage = profile.last_usage_date === today ? (profile.daily_usage || 0) : 0;
  const currentTotalUsage = profile.total_usage || 0;

  // 관리자 또는 유료 유저는 무제한
  const isAdmin = profile.email && ADMIN_EMAILS.includes(profile.email);
  if (isAdmin || profile.plan === 'paid') {
    const newDailyUsage = currentDailyUsage + 1;
    const newTotalUsage = currentTotalUsage + 1;

    await supabase
      .from('profiles')
      .update({
        daily_usage: newDailyUsage,
        total_usage: newTotalUsage,
        last_usage_date: today,
      })
      .eq('id', userId);

    // Google Sheets 동기화 (비동기, 실패해도 무시)
    syncUserToSheet({
      userId,
      email: profile.email || '',
      planType: profile.plan || 'paid',
      dailyUsage: newDailyUsage,
      totalUsage: newTotalUsage,
      lastAccessDate: today,
      signupDate: profile.created_at?.split('T')[0] || '',
      couponUsed: profile.coupon_used || false,
      couponCode: profile.coupon_code || '',
    }).catch(() => {});

    return { allowed: true, remaining: -1, plan: 'paid' };
  }

  // 무료 유저: 날짜가 바뀌면 리셋
  if (currentDailyUsage >= FREE_DAILY_LIMIT) {
    return { allowed: false, remaining: 0, plan: 'free' };
  }

  const newDailyUsage = currentDailyUsage + 1;
  const newTotalUsage = currentTotalUsage + 1;

  // 사용량 증가
  await supabase
    .from('profiles')
    .update({
      daily_usage: newDailyUsage,
      total_usage: newTotalUsage,
      last_usage_date: today,
    })
    .eq('id', userId);

  // Google Sheets 동기화 (비동기, 실패해도 무시)
  syncUserToSheet({
    userId,
    email: profile.email || '',
    planType: 'free',
    dailyUsage: newDailyUsage,
    totalUsage: newTotalUsage,
    lastAccessDate: today,
    signupDate: profile.created_at?.split('T')[0] || '',
    couponUsed: profile.coupon_used || false,
    couponCode: profile.coupon_code || '',
  }).catch(() => {});

  return {
    allowed: true,
    remaining: FREE_DAILY_LIMIT - newDailyUsage,
    plan: 'free',
  };
}
