import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// 미접속 알림 기준: 3일
const INACTIVE_DAYS = 3;
// 최대 알림 제한 (하루)
const MAX_REMINDERS_PER_RUN = 50;

type ReminderType = 'paid' | 'free';

/**
 * 카카오톡 알림 발송 placeholder
 * 유료/무료에 따라 다른 메시지 발송
 *
 * 유료: "원장님! 블로그 글쓰셔야죠 ,,ㅜㅜ 3일 넘게 안 쓰셨어요!"
 * 무료: "원장님, 구독하시면 매일 블로그 글을 쓸 수 있어요!"
 */
async function sendKakaoReminder(user: {
  id: string;
  name: string;
  phone: string | null;
  last_active_at: string;
  type: ReminderType;
}) {
  // TODO: 실제 카카오 알림톡 API 연동
  //
  // 템플릿 2개 필요:
  // 1. KAKAO_TEMPLATE_INACTIVE_PAID   — 유료 유저용
  //    "#{고객명}님! 블로그 글쓰셔야죠 ,,ㅜㅜ #{미접속일}일 넘게 안 쓰셨어요!
  //     지금 바로 새 글을 작성해보세요 👉 https://blogwriter.co.kr/write"
  //
  // 2. KAKAO_TEMPLATE_INACTIVE_FREE   — 무료 유저용
  //    "#{고객명}님, 블로그 글쓰기 잊지 않으셨죠?
  //     구독하시면 매일 더 많은 글을 작성할 수 있어요!
  //     👉 https://blogwriter.co.kr/pricing"
  //
  // 예시 (Solapi):
  // const templateId = user.type === 'paid'
  //   ? process.env.KAKAO_TEMPLATE_INACTIVE_PAID
  //   : process.env.KAKAO_TEMPLATE_INACTIVE_FREE;
  //
  // await fetch('https://api.solapi.com/messages/v4/send', {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Bearer ${process.env.SOLAPI_API_KEY}`,
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({
  //     message: {
  //       to: user.phone,
  //       from: process.env.SOLAPI_SENDER_NUMBER,
  //       kakaoOptions: {
  //         pfId: process.env.KAKAO_CHANNEL_ID,
  //         templateId,
  //         variables: {
  //           '#{고객명}': user.name,
  //           '#{미접속일}': `${INACTIVE_DAYS}`,
  //         },
  //       },
  //     },
  //   }),
  // });

  const label = user.type === 'paid' ? '유료' : '무료';
  console.log(`[REMINDER][${label}] ${user.name} (${user.phone || '번호없음'}) — 마지막 접속: ${user.last_active_at}`);
  return true;
}

export async function GET(request: NextRequest) {
  // Vercel Cron 인증 확인
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();

  try {
    // 3일 이상 미접속 유저 조회
    const cutoffDate = new Date(Date.now() - INACTIVE_DAYS * 24 * 60 * 60 * 1000).toISOString();

    const { data: inactiveUsers, error } = await supabase
      .from('profiles')
      .select('id, name, phone, last_active_at')
      .lt('last_active_at', cutoffDate)
      .not('name', 'is', null)
      .limit(MAX_REMINDERS_PER_RUN);

    if (error) {
      console.error('Inactive users query error:', error);
      return NextResponse.json({ error: 'Query failed' }, { status: 500 });
    }

    if (!inactiveUsers || inactiveUsers.length === 0) {
      return NextResponse.json({
        message: 'No inactive users found',
        checked_at: new Date().toISOString(),
      });
    }

    // 유료 구독 유저 ID 목록 조회 (활성 구독)
    const userIds = inactiveUsers.map(u => u.id);
    const { data: activeSubscriptions } = await supabase
      .from('subscriptions')
      .select('user_id')
      .in('user_id', userIds)
      .eq('status', 'active');

    const paidUserIds = new Set(
      (activeSubscriptions || []).map(s => s.user_id)
    );

    // 알림 발송
    let paidCount = 0;
    let freeCount = 0;
    let skippedCount = 0;

    for (const user of inactiveUsers) {
      const isPaid = paidUserIds.has(user.id);
      const reminderUser = { ...user, type: (isPaid ? 'paid' : 'free') as ReminderType };

      if (!user.phone) {
        skippedCount++;
        // 번호 없어도 로그는 남김
        await sendKakaoReminder(reminderUser);
        continue;
      }

      const sent = await sendKakaoReminder(reminderUser);
      if (sent) {
        if (isPaid) paidCount++;
        else freeCount++;
      }

      // API rate limit 방지
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return NextResponse.json({
      message: 'Reminders processed',
      total_inactive: inactiveUsers.length,
      sent_paid: paidCount,
      sent_free: freeCount,
      skipped_no_phone: skippedCount,
      checked_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Send reminders cron error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
