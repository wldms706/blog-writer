import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendSms, pickMobile, templates, SMS_ENABLED } from '@/lib/sms';

// 미접속 알림 기준
const INACTIVE_DAYS = 3;
// 이용권 만료 며칠 전에 알릴지
const EXPIRY_NOTICE_DAYS = 3;
// 한 번 실행에서 보낼 최대 건수 (비용 안전장치)
const MAX_PER_RUN = 50;
// 같은 사람에게 같은 종류를 다시 보내기까지의 최소 간격
const DEDUPE_HOURS = 24 * 7;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();
  const now = new Date();
  const result = {
    sms_enabled: SMS_ENABLED,
    coupon_expiring: { sent: 0, no_phone: 0, skipped: 0 },
    inactive: { sent: 0, no_phone: 0, no_consent: 0, skipped: 0 },
  };

  try {
    // ── 1. 이용권 만료 임박 (정보성 — 수신동의 불필요) ──────────────
    // 쿠폰으로 받은 이용권과 해지 예약 구독만 대상이다.
    // 유료 자동결제 구독의 next_billing_at 은 만료가 아니라 갱신일이므로 제외한다.
    const windowStart = new Date(now.getTime() + (EXPIRY_NOTICE_DAYS - 1) * 86400_000);
    const windowEnd = new Date(now.getTime() + (EXPIRY_NOTICE_DAYS + 1) * 86400_000);

    const { data: expiring } = await supabase
      .from('subscriptions')
      .select('user_id, plan_id, next_billing_at, status, payment_key')
      .in('status', ['active', 'cancelled'])
      .gte('next_billing_at', windowStart.toISOString())
      .lte('next_billing_at', windowEnd.toISOString())
      .limit(MAX_PER_RUN);

    for (const sub of expiring || []) {
      const isGrant = sub.payment_key === 'coupon_grant';
      const isCancelled = sub.status === 'cancelled';
      if (!isGrant && !isCancelled) continue; // 자동갱신 구독은 알릴 필요 없음

      const { data: p } = await supabase
        .from('profiles')
        .select('name, phone, shop_phone')
        .eq('id', sub.user_id)
        .maybeSingle();
      if (!p) continue;

      const to = pickMobile(p);
      if (!to) { result.coupon_expiring.no_phone++; continue; }

      const until = new Date(sub.next_billing_at).toLocaleDateString('ko-KR');
      const days = Math.max(1, Math.round((new Date(sub.next_billing_at).getTime() - now.getTime()) / 86400_000));

      const r = await sendSms({
        userId: sub.user_id,
        to,
        kind: 'coupon_expiring',
        subject: '이용권 만료 안내',
        text: templates.couponExpiring(p.name || '원장님', days, until),
        dedupeHours: DEDUPE_HOURS,
      });
      if (r.ok) result.coupon_expiring.sent++;
      else result.coupon_expiring.skipped++;
    }

    // ── 2. 미접속 리마인드 (광고성 — 수신동의 필수) ────────────────
    const cutoff = new Date(now.getTime() - INACTIVE_DAYS * 86400_000).toISOString();

    const { data: inactive } = await supabase
      .from('profiles')
      .select('id, name, phone, shop_phone, last_active_at, marketing_agreed')
      .eq('marketing_agreed', true)
      .lt('last_active_at', cutoff)
      .not('name', 'is', null)
      .limit(MAX_PER_RUN);

    const ids = (inactive || []).map(u => u.id);
    const { data: activeSubs } = ids.length
      ? await supabase.from('subscriptions').select('user_id').in('user_id', ids).eq('status', 'active')
      : { data: [] };
    const paidIds = new Set((activeSubs || []).map(s => s.user_id));

    for (const u of inactive || []) {
      // 광고성이므로 사전 수신동의가 없으면 보내지 않는다 (정보통신망법 제50조)
      if (!u.marketing_agreed) { result.inactive.no_consent++; continue; }

      const to = pickMobile(u);
      if (!to) { result.inactive.no_phone++; continue; }

      const days = Math.max(
        INACTIVE_DAYS,
        Math.round((now.getTime() - new Date(u.last_active_at).getTime()) / 86400_000),
      );

      const r = await sendSms({
        userId: u.id,
        to,
        kind: 'inactive',
        subject: '블로그라이터',
        text: templates.inactive(u.name || '원장님', days, paidIds.has(u.id)),
        dedupeHours: DEDUPE_HOURS,
      });
      if (r.ok) result.inactive.sent++;
      else result.inactive.skipped++;
    }

    return NextResponse.json({ message: '리마인더 처리 완료', ...result, checked_at: now.toISOString() });
  } catch (err) {
    console.error('리마인더 크론 오류:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
