import { createClient as createServerSupabase } from '@/lib/supabase/server';
import { syncUserToSheet } from '@/lib/google-sheets';

import { createAdminClient } from '@/lib/supabase/admin';

const FREE_CAPTION_LIMIT = 5;
const ADMIN_EMAILS = ['wldms706@naver.com', 'mwm2020@nate.com', 'gkdisk9@nate.com', 'etang12330@gmail.com'];

type BlogUsage = { allowed: boolean; remaining: number; plan: string };

// Preflight only checks access. Consume only after a complete, nonempty article exists.
export async function checkAndIncrementUsage(userId: string, consume = true): Promise<BlogUsage> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc('blog_usage_atomic', {
    p_user_id: userId,
    p_consume: consume,
  });
  if (error || !data) throw new Error('사용량 확인에 실패했습니다. 다시 시도해주세요.');
  const result = data as BlogUsage;
  if (consume && result.allowed) {
    const { data: profile } = await admin.from('profiles')
      .select('email, name, business_name, daily_usage, total_usage, last_usage_date, created_at, coupon_used, coupon_code')
      .eq('id', userId).maybeSingle();
    if (profile) syncUserToSheet({
      userId, email: profile.email || '', name: profile.name || '', businessName: profile.business_name || '',
      planType: result.plan, dailyUsage: profile.daily_usage || 0, totalUsage: profile.total_usage || 0,
      lastAccessDate: profile.last_usage_date || '', signupDate: profile.created_at?.split('T')[0] || '',
      couponUsed: profile.coupon_used || false, couponCode: profile.coupon_code || '',
    }).catch(() => {});
  }
  return result;
}

// 인스타 캡션 전용 카운트 (블로그와 별도)
export async function checkAndIncrementCaptionUsage(userId: string): Promise<{
  allowed: boolean;
  remaining: number;
  plan: string;
}> {
  const supabase = await createServerSupabase();

  const { data: profile } = await supabase
    .from('profiles')
    .select('email, plan, caption_usage, caption_bonus')
    .eq('id', userId)
    .single();

  if (!profile) {
    return { allowed: false, remaining: 0, plan: 'free' };
  }

  const currentCaptionUsage = profile.caption_usage || 0;
  const captionLimit = FREE_CAPTION_LIMIT + (profile.caption_bonus || 0);

  // 1순위: 관리자 또는 paid 유저 (블로그 구독자) → 무제한
  const isAdmin = profile.email && ADMIN_EMAILS.includes(profile.email);
  const isPaid = profile.plan === 'paid' || (profile.plan && profile.plan.startsWith('pro_'));

  if (isAdmin || isPaid) {
    await supabase
      .from('profiles')
      .update({ caption_usage: currentCaptionUsage + 1 })
      .eq('id', userId);
    return { allowed: true, remaining: -1, plan: 'paid' };
  }

  // 2순위: subscriptions 테이블에 유효한 구독이 있으면 무제한
  // (블로그/캡션 단독 모두 포함)
  const nowIso = new Date().toISOString();
  const { data: allSubs } = await supabase
    .from('subscriptions')
    .select('plan_id, status, next_billing_at')
    .eq('user_id', userId);

  const hasValidSub = (allSubs || []).some(sub => {
    const validPlanId = ['caption_only', 'pro_permanent', 'pro_general'].includes(sub.plan_id);
    if (!validPlanId) return false;
    if (sub.status === 'active') return true;
    if (sub.status === 'cancelled' && sub.next_billing_at && sub.next_billing_at > nowIso) return true;
    return false;
  });

  if (hasValidSub) {
    // plan을 paid로 자동 복구 (다음번에 빠르게 처리되도록)
    if (!isPaid) {
      await supabase.from('profiles').update({ plan: 'paid' }).eq('id', userId);
    }
    await supabase
      .from('profiles')
      .update({ caption_usage: currentCaptionUsage + 1 })
      .eq('id', userId);
    return { allowed: true, remaining: -1, plan: 'paid' };
  }

  // 무료 유저: 기본 5회 + 쿠폰 보너스
  if (currentCaptionUsage >= captionLimit) {
    return { allowed: false, remaining: 0, plan: 'free' };
  }

  const newUsage = currentCaptionUsage + 1;
  await supabase
    .from('profiles')
    .update({ caption_usage: newUsage })
    .eq('id', userId);

  return {
    allowed: true,
    remaining: captionLimit - newUsage,
    plan: 'free',
  };
}
