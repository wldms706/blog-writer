import crypto from 'crypto';
import { createAdminClient } from '@/lib/supabase/admin';

const API_KEY = process.env.SOLAPI_API_KEY || '';
const API_SECRET = process.env.SOLAPI_API_SECRET || '';
const SENDER = (process.env.SOLAPI_SENDER || '').replace(/\D/g, '');

export const SMS_ENABLED = Boolean(API_KEY && API_SECRET && SENDER);

/**
 * 메시지 종류.
 *
 * 정보성(consent: false) — 거래·계약 이행에 관한 안내. 수신동의 없이 발송 가능.
 * 광고성(consent: true)  — 이용 유도·혜택 안내. 사전 수신동의 필수이고
 *                          본문에 (광고) 표기와 무료 수신거부 방법을 넣어야 한다.
 *                          정보통신망법 제50조.
 */
export type SmsKind =
  | 'payment_failed'   // 정보성: 결제 실패
  | 'coupon_expiring'  // 정보성: 보유 이용권 만료 임박
  | 'inactive'         // 광고성: 미접속 리마인드
  | 'welcome';         // 광고성: 가입 환영 + 쿠폰 안내

export const REQUIRES_CONSENT: Record<SmsKind, boolean> = {
  payment_failed: false,
  coupon_expiring: false,
  inactive: true,
  welcome: true,
};

/** 휴대폰 번호만 남긴다. 유선번호(02, 031 …)는 문자 수신이 안 되므로 제외. */
export function normalizeMobile(raw?: string | null): string | null {
  if (!raw) return null;
  const d = String(raw).replace(/\D/g, '');
  if (/^01[016789]\d{7,8}$/.test(d)) return d;
  if (/^8201[016789]\d{7,8}$/.test(d)) return '0' + d.slice(2);
  return null;
}

/** 개인 번호를 우선하고, 없으면 매장 번호가 휴대폰일 때만 사용한다. */
export function pickMobile(p: { phone?: string | null; shop_phone?: string | null }): string | null {
  return normalizeMobile(p.phone) || normalizeMobile(p.shop_phone);
}

/** EUC-KR 기준 바이트 수(한글 2바이트). 90바이트 이하면 SMS, 넘으면 LMS. */
function byteLength(text: string): number {
  let n = 0;
  for (const ch of text) n += ch.charCodeAt(0) > 127 ? 2 : 1;
  return n;
}

function authHeader(): string {
  const date = new Date().toISOString();
  const salt = crypto.randomBytes(16).toString('hex');
  const signature = crypto.createHmac('sha256', API_SECRET).update(date + salt).digest('hex');
  return `HMAC-SHA256 apiKey=${API_KEY}, date=${date}, salt=${salt}, signature=${signature}`;
}

export type SendResult = { ok: boolean; skipped?: string; error?: string; messageId?: string };

/**
 * 같은 사람에게 같은 종류의 문자를 중복 발송하지 않기 위한 기록 확인.
 * sms_logs 테이블이 없으면 중복 방지 없이 통과시킨다(발송 자체는 막지 않음).
 */
async function alreadySent(userId: string, kind: SmsKind, withinHours: number): Promise<boolean> {
  const supabase = createAdminClient();
  const since = new Date(Date.now() - withinHours * 3600_000).toISOString();
  const { data, error } = await supabase
    .from('sms_logs')
    .select('id')
    .eq('user_id', userId)
    .eq('kind', kind)
    .eq('status', 'sent')
    .gte('created_at', since)
    .limit(1);

  if (error) {
    console.warn('[sms] sms_logs 조회 실패 — 중복 방지 없이 진행:', error.message);
    return false;
  }
  return Boolean(data?.length);
}

async function log(entry: {
  userId: string | null; kind: SmsKind; to: string; text: string;
  status: 'sent' | 'failed' | 'skipped'; error?: string;
}) {
  const supabase = createAdminClient();
  const { error } = await supabase.from('sms_logs').insert({
    user_id: entry.userId,
    kind: entry.kind,
    to_number: entry.to,
    text: entry.text,
    status: entry.status,
    error: entry.error ?? null,
  });
  if (error) console.warn('[sms] 발송 기록 실패:', error.message);
}

/**
 * 문자 발송. 90바이트를 넘으면 자동으로 LMS 로 전환된다.
 *
 * 키가 없으면 실제로 보내지 않고 로그만 남긴다(개발/미설정 환경에서 안전).
 */
export async function sendSms(params: {
  userId: string | null;
  to: string;
  kind: SmsKind;
  text: string;
  subject?: string;
  /** 이 시간(시간 단위) 안에 같은 종류를 보냈으면 건너뛴다. 0 이면 중복 검사 안 함. */
  dedupeHours?: number;
}): Promise<SendResult> {
  const to = normalizeMobile(params.to);
  if (!to) return { ok: false, skipped: 'invalid_number' };

  if (params.userId && params.dedupeHours) {
    if (await alreadySent(params.userId, params.kind, params.dedupeHours)) {
      return { ok: false, skipped: 'already_sent' };
    }
  }

  if (!SMS_ENABLED) {
    console.log(`[sms][미설정] ${params.kind} → ${to}\n${params.text}`);
    return { ok: false, skipped: 'not_configured' };
  }

  const isLms = byteLength(params.text) > 90;
  const body = {
    message: {
      to,
      from: SENDER,
      text: params.text,
      type: isLms ? 'LMS' : 'SMS',
      ...(isLms && params.subject ? { subject: params.subject } : {}),
    },
  };

  try {
    const res = await fetch('https://api.solapi.com/messages/v4/send', {
      method: 'POST',
      headers: { Authorization: authHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();

    if (!res.ok) {
      const msg = data?.errorMessage || data?.message || `HTTP ${res.status}`;
      console.error(`[sms] 발송 실패 ${params.kind} → ${to}:`, msg);
      await log({ userId: params.userId, kind: params.kind, to, text: params.text, status: 'failed', error: String(msg) });
      return { ok: false, error: String(msg) };
    }

    await log({ userId: params.userId, kind: params.kind, to, text: params.text, status: 'sent' });
    return { ok: true, messageId: data?.messageId };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[sms] 발송 오류 ${params.kind} → ${to}:`, msg);
    await log({ userId: params.userId, kind: params.kind, to, text: params.text, status: 'failed', error: msg });
    return { ok: false, error: msg };
  }
}

// ── 메시지 문안 ──────────────────────────────────────────────
// 광고성(inactive, welcome)에는 (광고) 표기와 무료 수신거부 안내가 들어간다.

// 광고성 문자에 반드시 표기해야 하는 무료 수신거부번호 (솔라피 발급)
const UNSUBSCRIBE = '무료수신거부 080-500-4233';

export const templates = {
  paymentFailed: (name: string, cardLast4: string) =>
    `[블로그라이터] ${name}님, 자동결제가 실패했어요.\n` +
    `등록카드(${cardLast4})에서 결제가 승인되지 않아 구독이 해지될 예정입니다.\n` +
    `카드를 다시 등록해주세요.\nhttps://blogwriter.co.kr/subscribe`,

  couponExpiring: (name: string, days: number, until: string) =>
    `[블로그라이터] ${name}님, 이용권이 ${days}일 뒤 만료됩니다. (${until}까지)\n` +
    `만료 후에는 무료 플랜으로 전환됩니다.\n` +
    `계속 이용하시려면 구독해주세요.\nhttps://blogwriter.co.kr/pricing`,

  inactive: (name: string, days: number, isPaid: boolean) =>
    isPaid
      ? `(광고)[블로그라이터] ${name}님, ${days}일째 글을 안 쓰셨어요!\n` +
        `오늘 한 편 어떠세요? 5분이면 됩니다.\nhttps://blogwriter.co.kr/write\n${UNSUBSCRIBE}`
      : `(광고)[블로그라이터] ${name}님, 블로그 글쓰기 잊지 않으셨죠?\n` +
        `구독하시면 매일 무제한으로 쓸 수 있어요.\nhttps://blogwriter.co.kr/pricing\n${UNSUBSCRIBE}`,

  welcome: (name: string) =>
    `(광고)[블로그라이터] ${name}님, 가입을 환영합니다!\n` +
    `강의·이벤트 쿠폰이 있으시면 등록하고 PRO를 무료로 써보세요.\n` +
    `https://blogwriter.co.kr/redeem\n${UNSUBSCRIBE}`,
};
