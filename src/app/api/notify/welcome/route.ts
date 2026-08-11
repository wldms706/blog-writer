import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendSms, pickMobile, templates } from '@/lib/sms';

// 온보딩 완료 직후 호출된다.
// 환영 문자는 쿠폰 등록 안내가 들어가 광고성이므로 수신동의한 사용자에게만 보낸다.
export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: p } = await admin
    .from('profiles')
    .select('name, phone, shop_phone, marketing_agreed')
    .eq('id', user.id)
    .maybeSingle();

  if (!p) return NextResponse.json({ sent: false, reason: 'no_profile' });
  if (!p.marketing_agreed) return NextResponse.json({ sent: false, reason: 'no_consent' });

  const to = pickMobile(p);
  if (!to) return NextResponse.json({ sent: false, reason: 'no_phone' });

  const r = await sendSms({
    userId: user.id,
    to,
    kind: 'welcome',
    subject: '블로그라이터 가입을 환영합니다',
    text: templates.welcome(p.name || '원장님'),
    // 재가입·재호출로 중복 발송되지 않도록 (사실상 1회)
    dedupeHours: 24 * 365,
  });

  return NextResponse.json({ sent: r.ok, reason: r.skipped ?? r.error ?? null });
}
