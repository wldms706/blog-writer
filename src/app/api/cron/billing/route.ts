import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { nanoid } from 'nanoid';

const TOSS_SECRET_KEY = process.env.TOSS_SECRET_KEY || '';
const CRON_SECRET = process.env.CRON_SECRET || '';

export async function GET(request: NextRequest) {
  // 크론 인증
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();
  const now = new Date().toISOString();

  // 결제일이 지난 활성 구독 조회
  const { data: subscriptions, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('status', 'active')
    .not('billing_key', 'is', null)
    .lte('next_billing_at', now);

  if (error) {
    console.error('[빌링 크론] 구독 조회 실패:', error);
    return NextResponse.json({ error: 'DB 조회 실패' }, { status: 500 });
  }

  if (!subscriptions || subscriptions.length === 0) {
    return NextResponse.json({ message: '결제할 구독 없음', charged: 0 });
  }

  const authString = Buffer.from(`${TOSS_SECRET_KEY}:`).toString('base64');
  let successCount = 0;
  let failCount = 0;

  for (const sub of subscriptions) {
    const orderId = `billing_${nanoid()}`;

    try {
      // 쿠폰 할인 적용
      const discountPercent = sub.discount_percent || 0;
      const chargeAmount = discountPercent > 0 ? Math.round(sub.price * (1 - discountPercent / 100)) : sub.price;

      const res = await fetch(`https://api.tosspayments.com/v1/billing/${sub.billing_key}`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${authString}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerKey: sub.customer_key,
          amount: chargeAmount,
          orderId,
          orderName: `블로그라이터 ${sub.plan_name} 월 구독${discountPercent > 0 ? ` (${discountPercent}% 할인)` : ''}`,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // 성공: 다음 결제일 +1달, 결제 정보 업데이트
        const nextBilling = new Date();
        nextBilling.setMonth(nextBilling.getMonth() + 1);

        await supabase
          .from('subscriptions')
          .update({
            payment_key: data.paymentKey,
            order_id: orderId,
            next_billing_at: nextBilling.toISOString(),
            retry_count: 0,
            updated_at: new Date().toISOString(),
          })
          .eq('id', sub.id);

        successCount++;
        console.log(`[빌링 크론] 결제 성공: user=${sub.user_id}, amount=${sub.price}`);
      } else {
        // 실패: 재시도 카운트 증가
        const retryCount = (sub.retry_count || 0) + 1;

        const updateData: Record<string, unknown> = {
          retry_count: retryCount,
          updated_at: new Date().toISOString(),
        };

        // 3회 연속 실패 시 구독 일시정지
        if (retryCount >= 3) {
          updateData.status = 'payment_failed';
          // 프로필도 무료로 변경
          await supabase
            .from('profiles')
            .update({ plan: 'free', plan_type: null, updated_at: new Date().toISOString() })
            .eq('id', sub.user_id);
        }

        await supabase
          .from('subscriptions')
          .update(updateData)
          .eq('id', sub.id);

        failCount++;
        console.error(`[빌링 크론] 결제 실패: user=${sub.user_id}, error=${data.message}, retry=${retryCount}`);
      }
    } catch (err) {
      failCount++;
      console.error(`[빌링 크론] 결제 오류: user=${sub.user_id}`, err);
    }
  }

  return NextResponse.json({
    message: '빌링 크론 완료',
    total: subscriptions.length,
    success: successCount,
    failed: failCount,
  });
}
