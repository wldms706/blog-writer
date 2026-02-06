import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const TOSS_SECRET_KEY = process.env.TOSS_SECRET_KEY || '';

// 플랜 정보
const PLANS: Record<string, { name: string; price: number; type: string }> = {
  pro_permanent: { name: '프로 (반영구)', price: 19900, type: 'permanent' },
  pro_general: { name: '프로 (일반)', price: 14900, type: 'general' },
};

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

    // Supabase에서 현재 유저 가져오기
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error('유저 인증 실패:', userError);
      return NextResponse.json(
        { success: false, message: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    // 구독 정보 저장
    const now = new Date();
    const nextBillingDate = new Date(now);
    nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

    const { error: subscriptionError } = await supabase
      .from('subscriptions')
      .upsert({
        user_id: user.id,
        plan_id: planId,
        plan_name: plan.name,
        plan_type: plan.type,
        price: plan.price,
        status: 'active',
        payment_key: paymentKey,
        order_id: orderId,
        billing_key: paymentData.card?.billingKey || null, // 빌링키 (자동결제용)
        card_company: paymentData.card?.company || null,
        card_number: paymentData.card?.number || null,
        started_at: now.toISOString(),
        next_billing_at: nextBillingDate.toISOString(),
        updated_at: now.toISOString(),
      }, {
        onConflict: 'user_id',
      });

    if (subscriptionError) {
      console.error('구독 정보 저장 실패:', subscriptionError);
      // 결제는 성공했으므로 일단 성공 응답
      // 추후 관리자가 수동으로 처리
    }

    // 유저 프로필 업데이트 (플랜 정보)
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        plan: planId,
        plan_type: plan.type,
        updated_at: now.toISOString(),
      })
      .eq('id', user.id);

    if (profileError) {
      console.error('프로필 업데이트 실패:', profileError);
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
