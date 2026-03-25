import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const TOSS_SECRET_KEY = process.env.TOSS_SECRET_KEY || '';

// 플랜 정보
const PLANS: Record<string, { name: string; price: number; type: string }> = {
  pro_permanent: { name: '프로 (반영구)', price: 12900, type: 'permanent' },
  pro_general: { name: '프로 (일반)', price: 9900, type: 'general' },
};

// 재시도 헬퍼 (최대 3회)
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
    const { paymentKey, orderId, amount, planId } = await request.json();

    // 필수 파라미터 검증
    if (!paymentKey || !orderId || !amount) {
      return NextResponse.json(
        { success: false, message: '필수 파라미터가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 플랜 검증
    const plan = PLANS[planId];
    if (!plan) {
      return NextResponse.json(
        { success: false, message: '유효하지 않은 플랜입니다.' },
        { status: 400 }
      );
    }

    // 금액 검증
    if (amount !== plan.price) {
      return NextResponse.json(
        { success: false, message: '결제 금액이 일치하지 않습니다.' },
        { status: 400 }
      );
    }

    // Supabase에서 현재 유저 먼저 확인 (결제 승인 전에 유저 검증)
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error('유저 인증 실패:', userError);
      return NextResponse.json(
        { success: false, message: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    // 중복 결제 방지: 같은 orderId로 이미 처리된 결제가 있는지 확인
    const { data: existingSubscription } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('order_id', orderId)
      .maybeSingle();

    if (existingSubscription) {
      return NextResponse.json({
        success: true,
        message: '이미 처리된 결제입니다.',
        data: { orderId, planId, planName: plan.name },
      });
    }

    // 토스페이먼츠 결제 승인 요청
    const authString = Buffer.from(`${TOSS_SECRET_KEY}:`).toString('base64');

    const confirmResponse = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentKey,
        orderId,
        amount,
      }),
    });

    const paymentData = await confirmResponse.json();

    if (!confirmResponse.ok) {
      console.error('토스페이먼츠 결제 승인 실패:', paymentData);
      return NextResponse.json(
        { success: false, message: paymentData.message || '결제 승인에 실패했습니다.' },
        { status: 400 }
      );
    }

    // 구독 정보 저장 (재시도 포함)
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
      payment_key: paymentKey,
      order_id: orderId,
      billing_key: paymentData.card?.billingKey || null,
      card_company: paymentData.card?.company || null,
      card_number: paymentData.card?.number || null,
      started_at: now.toISOString(),
      next_billing_at: nextBillingDate.toISOString(),
      updated_at: now.toISOString(),
    };

    let subscriptionSaved = false;
    try {
      await retryOperation(async () => {
        const { error } = await supabase
          .from('subscriptions')
          .upsert(subscriptionData, { onConflict: 'user_id' });
        if (error) throw error;
      });
      subscriptionSaved = true;
    } catch (error) {
      console.error('[결제 치명적 오류] 구독 저장 3회 실패:', {
        userId: user.id,
        orderId,
        paymentKey,
        planId,
        error,
      });
    }

    // 프로필 업데이트 (재시도 포함)
    let profileSaved = false;
    try {
      await retryOperation(async () => {
        const { error } = await supabase
          .from('profiles')
          .update({
            plan: 'paid',
            plan_type: planId,
            updated_at: now.toISOString(),
          })
          .eq('id', user.id);
        if (error) throw error;
      });
      profileSaved = true;
    } catch (error) {
      console.error('[결제 치명적 오류] 프로필 업데이트 3회 실패:', {
        userId: user.id,
        orderId,
        error,
      });
    }

    // 결제는 성공했지만 DB 저장 실패 시, 복구용 로그 기록
    if (!subscriptionSaved || !profileSaved) {
      console.error('[결제 복구 필요]', JSON.stringify({
        userId: user.id,
        email: user.email,
        orderId,
        paymentKey,
        planId,
        planName: plan.name,
        subscriptionSaved,
        profileSaved,
        timestamp: now.toISOString(),
      }));
    }

    return NextResponse.json({
      success: true,
      message: '결제가 완료되었습니다.',
      data: {
        orderId: paymentData.orderId,
        planId,
        planName: plan.name,
      },
    });

  } catch (error) {
    console.error('결제 확인 API 오류:', error);
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
