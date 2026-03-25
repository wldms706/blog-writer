import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { nanoid } from 'nanoid';

const TOSS_SECRET_KEY = process.env.TOSS_SECRET_KEY || '';

const PLANS: Record<string, { name: string; price: number; type: string }> = {
  pro_permanent: { name: '프로 (반영구)', price: 12900, type: 'permanent' },
  pro_general: { name: '프로 (일반)', price: 9900, type: 'general' },
};

async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 500 * attempt));
      }
    }
  }
  throw lastError;
}

export async function POST(request: NextRequest) {
  try {
    const { authKey, customerKey, planId } = await request.json();

    if (!authKey || !customerKey) {
      return NextResponse.json(
        { success: false, message: '필수 파라미터가 누락되었습니다.' },
        { status: 400 },
      );
    }

    const plan = PLANS[planId];
    if (!plan) {
      return NextResponse.json(
        { success: false, message: '유효하지 않은 플랜입니다.' },
        { status: 400 },
      );
    }

    // 유저 확인
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json(
        { success: false, message: '인증이 필요합니다.' },
        { status: 401 },
      );
    }

    const authString = Buffer.from(`${TOSS_SECRET_KEY}:`).toString('base64');

    // 1단계: 빌링키 발급
    const billingResponse = await fetch('https://api.tosspayments.com/v1/billing/authorizations/issue', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ authKey, customerKey }),
    });

    const billingData = await billingResponse.json();

    if (!billingResponse.ok) {
      console.error('빌링키 발급 실패:', billingData);
      return NextResponse.json(
        { success: false, message: billingData.message || '카드 등록에 실패했습니다.' },
        { status: 400 },
      );
    }

    const billingKey = billingData.billingKey;

    // 2단계: 첫 결제 승인
    const orderId = `billing_${nanoid()}`;

    const chargeResponse = await fetch(`https://api.tosspayments.com/v1/billing/${billingKey}`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customerKey,
        amount: plan.price,
        orderId,
        orderName: `블로그라이터 ${plan.name} 월 구독`,
        customerEmail: user.email || '',
        customerName: user.email?.split('@')[0] || '',
      }),
    });

    const chargeData = await chargeResponse.json();

    if (!chargeResponse.ok) {
      console.error('첫 결제 승인 실패:', chargeData);
      return NextResponse.json(
        { success: false, message: chargeData.message || '첫 결제에 실패했습니다.' },
        { status: 400 },
      );
    }

    // 3단계: DB 저장
    const now = new Date();
    const nextBillingDate = new Date(now);
    nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

    const subscriptionData = {
      user_id: user.id,
      plan_id: planId,
      plan_name: plan.name,
      plan_type: plan.type,
      price: plan.price,
      status: 'active',
      payment_key: chargeData.paymentKey,
      order_id: orderId,
      billing_key: billingKey,
      customer_key: customerKey,
      card_company: chargeData.card?.issuerCode || null,
      card_number: chargeData.card?.number || null,
      started_at: now.toISOString(),
      next_billing_at: nextBillingDate.toISOString(),
      updated_at: now.toISOString(),
    };

    try {
      await retryOperation(async () => {
        const { error } = await supabase
          .from('subscriptions')
          .upsert(subscriptionData, { onConflict: 'user_id' });
        if (error) throw error;
      });
    } catch (error) {
      console.error('[빌링 치명적 오류] 구독 저장 실패:', { userId: user.id, orderId, error });
    }

    try {
      await retryOperation(async () => {
        const { error } = await supabase
          .from('profiles')
          .update({ plan: 'paid', plan_type: planId, updated_at: now.toISOString() })
          .eq('id', user.id);
        if (error) throw error;
      });
    } catch (error) {
      console.error('[빌링 치명적 오류] 프로필 업데이트 실패:', { userId: user.id, error });
    }

    return NextResponse.json({
      success: true,
      message: '구독이 시작되었습니다.',
      data: { orderId, planId, planName: plan.name },
    });
  } catch (error) {
    console.error('빌링 발급 API 오류:', error);
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}
