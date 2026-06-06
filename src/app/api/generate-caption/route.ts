import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkAndIncrementCaptionUsage } from '@/lib/usage';
import { buildCaptionPrompt, CaptionStyle } from '@/lib/prompts/caption-prompts';
import { filterMedicalTerms, filterForeignWords } from '@/lib/prompts/filters';

export const maxDuration = 60;

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

function sanitize(input: unknown): string {
  if (typeof input !== 'string') return '';
  return input.replace(/[{}[\]`]/g, '').replace(/\n/g, ' ').slice(0, 500).trim();
}

export async function POST(request: NextRequest) {
  if (!ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'API 키가 설정되지 않았습니다.' }, { status: 500 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  // 🔐 안전장치: API 라우트에서 직접 어드민/유료 체크 (usage.ts 의존 X)
  const ADMIN_EMAILS_DIRECT = ['wldms706@naver.com', 'mwm2020@nate.com', 'gkdisk9@nate.com', 'etang12330@gmail.com'];
  const isDirectAdmin = user.email && ADMIN_EMAILS_DIRECT.includes(user.email);

  let isDirectPaid = false;
  if (!isDirectAdmin) {
    const { data: directProfile } = await supabase
      .from('profiles')
      .select('plan')
      .eq('id', user.id)
      .single();
    isDirectPaid = directProfile?.plan === 'paid' || (directProfile?.plan && directProfile.plan.startsWith('pro_')) || false;

    // 구독 직접 확인
    if (!isDirectPaid) {
      const { data: directSubs } = await supabase
        .from('subscriptions')
        .select('plan_id, status, next_billing_at')
        .eq('user_id', user.id);
      const nowIsoDirect = new Date().toISOString();
      isDirectPaid = (directSubs || []).some(s =>
        ['caption_only', 'pro_permanent', 'pro_general'].includes(s.plan_id) &&
        (s.status === 'active' || (s.status === 'cancelled' && s.next_billing_at && s.next_billing_at > nowIsoDirect))
      );
    }
  }

  // 어드민/유료/유효구독자는 무조건 통과
  if (!isDirectAdmin && !isDirectPaid) {
    const usage = await checkAndIncrementCaptionUsage(user.id);
    if (!usage.allowed) {
      return NextResponse.json(
        { error: '무료 인스타 캡션(5회)을 모두 사용했습니다. 구독하시면 무제한으로 이용할 수 있습니다.', remaining: 0 },
        { status: 403 },
      );
    }
  }

  try {
    const { style, businessCategory, topic, detail } = await request.json();

    const validStyles: CaptionStyle[] = ['knowhow', 'customer', 'confidence', 'philosophy', 'daily'];
    if (!validStyles.includes(style)) {
      return NextResponse.json({ error: '유효하지 않은 캡션 유형입니다.' }, { status: 400 });
    }

    const safeBusinessCategory = sanitize(businessCategory);
    const safeTopic = sanitize(topic);
    const safeDetail = sanitize(detail);

    if (!safeTopic) {
      return NextResponse.json({ error: '주제/키워드를 입력해주세요.' }, { status: 400 });
    }

    const prompt = buildCaptionPrompt(style as CaptionStyle, safeBusinessCategory, safeTopic, safeDetail);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        temperature: 1,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Claude API error:', errorData);
      return NextResponse.json({ error: 'AI 생성에 실패했습니다.' }, { status: 500 });
    }

    const data = await response.json();
    const generatedText = data.content?.[0]?.text || '';

    if (!generatedText) {
      return NextResponse.json({ error: '생성된 텍스트가 없습니다.' }, { status: 500 });
    }

    // 가벼운 후처리
    let filtered = filterMedicalTerms(generatedText);
    filtered = filterForeignWords(filtered);

    return NextResponse.json({ content: filtered });
  } catch (error) {
    console.error('Caption generate error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
