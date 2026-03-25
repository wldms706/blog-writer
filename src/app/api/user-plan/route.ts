import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ planId: null });
  }

  // 활성 구독 또는 취소했지만 아직 기간 남은 구독 모두 확인
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('plan_id, status, next_billing_at')
    .eq('user_id', user.id)
    .in('status', ['active', 'cancelled'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  // 구독이 있고, 아직 결제 기간이 남아있으면 해당 플랜 유지
  if (subscription) {
    const now = new Date();
    const nextBilling = subscription.next_billing_at ? new Date(subscription.next_billing_at) : null;

    if (subscription.status === 'active' || (nextBilling && nextBilling > now)) {
      return NextResponse.json({ planId: subscription.plan_id });
    }
  }

  return NextResponse.json({ planId: null });
}
