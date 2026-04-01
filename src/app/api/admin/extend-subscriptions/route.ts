import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

const CRON_SECRET = process.env.CRON_SECRET || '';

// 점검 종료 후 1회 실행: 모든 활성 구독자의 next_billing_at을 연장일수만큼 늘려줌
// 사용법: GET /api/admin/extend-subscriptions?days=7
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const days = parseInt(request.nextUrl.searchParams.get('days') || '7');

  const supabase = createAdminClient();

  // 활성 구독자 조회
  const { data: subscriptions, error } = await supabase
    .from('subscriptions')
    .select('id, user_id, next_billing_at')
    .eq('status', 'active');

  if (error) {
    return NextResponse.json({ error: 'DB 조회 실패' }, { status: 500 });
  }

  if (!subscriptions || subscriptions.length === 0) {
    return NextResponse.json({ message: '연장할 구독 없음', extended: 0 });
  }

  let extendedCount = 0;

  for (const sub of subscriptions) {
    const currentDate = new Date(sub.next_billing_at);
    currentDate.setDate(currentDate.getDate() + days);

    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        next_billing_at: currentDate.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', sub.id);

    if (!updateError) extendedCount++;
  }

  return NextResponse.json({
    message: `${extendedCount}명 구독 기간 ${days}일 연장 완료`,
    total: subscriptions.length,
    extended: extendedCount,
  });
}
