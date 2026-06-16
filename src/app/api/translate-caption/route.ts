import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const maxDuration = 60;

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

type Language = 'en' | 'ja' | 'zh';

const LANGUAGE_GUIDES: Record<Language, string> = {
  en: `Translate to English in a natural Instagram caption style.
- Use casual, warm tone (not formal)
- Keep line breaks (use empty lines between paragraphs)
- Use emojis naturally in English context
- Use English instagram conventions (e.g., "Today I'd like to share..." instead of literal translation)
- Keep proper nouns (brand names, places) as-is or transliterate naturally`,

  ja: `日本のインスタグラムキャプションのスタイルで自然に翻訳してください。
- 親しみやすく丁寧な口調を使う(です・ます調と砕けた表現の混合)
- 改行を保持(段落の間に空行を入れる)
- 日本の絵文字文化に合わせて自然に絵文字を使う(✨🤍💫💕など)
- 固有名詞(ブランド名、地名)はそのまま、または自然にローマ字化
- 「〜だと思います」「〜ですよね」など、日本人インスタグラマーらしい表現を使う`,

  zh: `请翻译成中文小红书/Instagram风格的自然帖子。
- 使用亲切温暖的语气(不要太正式)
- 保留换行(段落之间用空行分隔)
- 自然地使用中文社交媒体常用的emoji(✨🤍💫💕等)
- 专有名词(品牌名、地名)保留原样或自然音译
- 使用"姐妹们""家人们""真的"等中文社交媒体的自然表达
- 简体中文使用`,
};

const LANGUAGE_NAMES: Record<Language, string> = {
  en: 'English',
  ja: '日本語',
  zh: '中文',
};

export async function POST(request: NextRequest) {
  if (!ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'API 키가 설정되지 않았습니다.' }, { status: 500 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  try {
    const { text, language } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: '번역할 텍스트가 없습니다.' }, { status: 400 });
    }

    if (!['en', 'ja', 'zh'].includes(language)) {
      return NextResponse.json({ error: '유효하지 않은 언어입니다.' }, { status: 400 });
    }

    const lang = language as Language;
    const guide = LANGUAGE_GUIDES[lang];
    const langName = LANGUAGE_NAMES[lang];

    const prompt = `You are translating a Korean beauty shop owner's Instagram caption to ${langName}.

${guide}

## Original Korean Caption:
${text}

## Important Rules:
- Do NOT just literally translate. Adapt to the target language's Instagram culture.
- Preserve the warm, professional beauty shop owner persona.
- Keep the same emotional tone (sincere, confident, or empathetic).
- Maintain paragraph structure with empty lines between paragraphs.
- Output ONLY the translated caption. No explanations, no notes.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 2048,
        temperature: 0.7,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Claude API error:', errorData);
      return NextResponse.json({ error: 'AI 번역에 실패했습니다.' }, { status: 500 });
    }

    const data = await response.json();
    const translatedText = data.content?.[0]?.text || '';

    if (!translatedText) {
      return NextResponse.json({ error: '번역 결과가 없습니다.' }, { status: 500 });
    }

    return NextResponse.json({ content: translatedText });
  } catch (error) {
    console.error('Translate error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
