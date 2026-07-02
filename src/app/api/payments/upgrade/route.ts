import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { nanoid } from 'nanoid';

const TOSS_SECRET_KEY = process.env.TOSS_SECRET_KEY || '';

const PERMANENT_PLAN = {
  id: 'pro_permanent',
  name: '프로 (반영구)',
  type: 'permanent',
  price: 12900,
};

const GENERAL_PRICE = 9900;

// GET: 업그레이드 시 결제될 차액 미리 계산 (모달 표시용)
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('plan_id, status, next_billing_at, billing_key')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!subscription) {
    return NextResponse.json({ error: '구독이 없습니다.' }, { status: 400 });
  }

  // active + cancelled(만료 전) 둘 다 업그레이드 허용
  const isCancelledButValid =
    subscription.status === 'cancelled' &&
    subscription.next_billing_at &&
    new Date(subscription.next_billing_at) > new Date();

  if (subscription.status !== 'active' && !isCancelledButValid) {
    return NextResponse.json({ error: '만료된 구독은 업그레이드할 수 없어요. 새로 구독해주세요.' }, { status: 400 });
  }

  if (subscription.plan_id !== 'pro_general') {
    return NextResponse.json({ error: '일반 플랜 사용자만 업그레이드 가능해요.' }, { status: 400 });
  }

  if (!subscription.billing_key) {
    return NextResponse.json({ error: '결제 카드 정보가 없어요. 새로 구독해주세요.' }, { status: 400 });
  }

  const { amount, remainingDays } = calculateProratedAmount(subscription.next_billing_at);

  return NextResponse.json({
    amount,
    remainingDays,
    nextBillingAt: subscription.next_billing_at,
    currentPlan: '프로 (일반) ₩9,900/월',
    targetPlan: '프로 (반영구) ₩12,900/월',
    reactivation: isCancelledButValid, // 취소 상태 → 재활성화 여부
  });
}

// POST: 실제 업그레이드 실행
export async function POST(_request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!subscription) {
    return NextResponse.json({ error: '구독이 없어요.' }, { status: 400 });
  }

  const isCancelledButValid =
    subscription.status === 'cancelled' &&
    subscription.next_billing_at &&
    new Date(subscription.next_billing_at) > new Date();

  if (subscription.status !== 'active' && !isCancelledButValid) {
    return NextResponse.json({ error: '만료된 구독은 업그레이드할 수 없어요.' }, { status: 400 });
  }

  if (subscription.plan_id !== 'pro_general') {
    return NextResponse.json({ error: '일반 플랜만 업그레이드 가능해요.' }, { status: 400 });
  }

  if (!subscription.billing_key) {
    return NextResponse.json({ error: '결제 카드가 등록되지 않았어요.' }, { status: 400 });
  }

  const { amount } = calculateProratedAmount(subscription.next_billing_at);

  // 취소 상태였다면 active로 재활성화
  const reactivationUpdate = isCancelledButValid
    ? { status: 'active', cancelled_at: null, cancel_reason: null }
    : {};

  if (amount < 100) {
    // 남은 기간이 너무 짧아서 차액이 100원 미만이면 즉시 결제 없이 승격만
    const now = new Date().toISOString();
    await supabase
      .from('subscriptions')
      .update({
        plan_id: PERMANENT_PLAN.id,
        plan_name: PERMANENT_PLAN.name,
        plan_type: PERMANENT_PLAN.type,
        price: PERMANENT_PLAN.price,
        updated_at: now,
        ...reactivationUpdate,
      })
      .eq('id', subscription.id);

    // 취소 상태였다면 profiles도 paid로 되돌리기
    if (isCancelledButValid) {
      await supabase.from('profiles').update({ plan: 'paid' }).eq('id', user.id);
    }

    return NextResponse.json({
      success: true,
      charged: 0,
      reactivated: isCancelledButValid,
      message: isCancelledButValid
        ? '구독이 재활성화되고 프로(반영구)로 승격됐어요. 다음 결제일부터 자동 결제됩니다.'
        : '남은 기간이 짧아 차액 결제 없이 승격됐어요.',
    });
  }

  // Toss 빌링키로 차액 결제
  const orderId = `upgrade_${nanoid()}`;
  const authString = Buffer.from(`${TOSS_SECRET_KEY}:`).toString('base64');

  const chargeResponse = await fetch(`https://api.tosspayments.com/v1/billing/${subscription.billing_key}`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${authString}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      customerKey: subscription.customer_key,
      amount,
      orderId,
      orderName: `블로그라이터 프로(반영구) 업그레이드 차액`,
      customerEmail: user.email || '',
      customerName: user.email?.split('@')[0] || '',
    }),
  });

  const chargeData = await chargeResponse.json();

  if (!chargeResponse.ok) {
    console.error('업그레이드 차액 결제 실패:', chargeData);
    return NextResponse.json(
      { error: chargeData.message || '결제에 실패했어요. 카드를 확인해주세요.' },
      { status: 400 },
    );
  }

  // 구독 정보 업데이트 (next_billing_at 유지, 취소 상태였다면 재활성화)
  const now = new Date().toISOString();
  const { error: updateError } = await supabase
    .from('subscriptions')
    .update({
      plan_id: PERMANENT_PLAN.id,
      plan_name: PERMANENT_PLAN.name,
      plan_type: PERMANENT_PLAN.type,
      price: PERMANENT_PLAN.price,
      updated_at: now,
      ...reactivationUpdate,
    })
    .eq('id', subscription.id);

  if (updateError) {
    console.error('구독 업그레이드 DB 업데이트 실패:', updateError);
  }

  // 취소 상태였다면 profiles도 paid로 복원
  if (isCancelledButValid) {
    await supabase.from('profiles').update({ plan: 'paid' }).eq('id', user.id);
  }

  return NextResponse.json({
    success: true,
    charged: amount,
    orderId,
    reactivated: isCancelledButValid,
    message: isCancelledButValid
      ? `차액 ${amount.toLocaleString()}원 결제 완료! 구독이 재활성화되고 프로(반영구)로 승격됐어요.`
      : `차액 ${amount.toLocaleString()}원 결제 완료! 이제 프로(반영구) 플랜입니다.`,
  });
}

function calculateProratedAmount(nextBillingAt: string | null): { amount: number; remainingDays: number } {
  const now = new Date();
  const next = nextBillingAt ? new Date(nextBillingAt) : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const remainingMs = next.getTime() - now.getTime();
  const remainingDays = Math.max(0, Math.ceil(remainingMs / (24 * 60 * 60 * 1000)));

  const priceDiffPerDay = (PERMANENT_PLAN.price - GENERAL_PRICE) / 30;
  const rawAmount = priceDiffPerDay * remainingDays;
  // 100원 단위로 반올림
  const amount = Math.round(rawAmount / 100) * 100;

  return { amount, remainingDays };
}
