import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  filterMedicalTerms,
  filterForeignWords,
  filterListBullets,
  filterFirstPerson,
  filterBannedWords,
  REGULATED_KEYWORDS,
} from '@/lib/prompts';

export const maxDuration = 60;

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

function sanitize(input: unknown): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/[{}[\]`]/g, '')
    .replace(/\n/g, ' ')
    .slice(0, 500)
    .trim();
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

  try {
    const { originalContent, instruction, keyword, businessCategory } = await request.json();

    if (!originalContent || !instruction) {
      return NextResponse.json({ error: '원본 글과 수정 지시가 필요합니다.' }, { status: 400 });
    }

    const safeInstruction = sanitize(instruction);
    const safeKeyword = sanitize(keyword);
    const safeBusinessCategory = sanitize(businessCategory);

    const isRegulatedBusiness = safeBusinessCategory === 'semi-permanent' || safeBusinessCategory === '반영구' || REGULATED_KEYWORDS.some(k => safeKeyword.includes(k));

    const prompt = `당신은 블로그 글 수정 전문가입니다.

아래 원본 글을 사용자의 수정 요청에 따라 수정해주세요.

## 수정 규칙 (절대 준수)
1. 사용자가 요청한 부분만 수정하세요. 요청하지 않은 부분은 원본 그대로 유지하세요.
2. 글의 전체 구조와 톤은 유지하되, 요청된 변경만 적용하세요.
3. 수정 후에도 키워드 "${safeKeyword}"가 본문에 4~6회 포함되어야 합니다.
4. 마크다운(##, **, ---, 리스트 기호) 절대 금지. 순수 텍스트만.
5. [편집가이드: ...] 형태는 그대로 유지하세요.
6. 한국어만 사용. 영어 금지.
${isRegulatedBusiness ? '7. 1인칭(저는, 제가, 저희) 절대 금지.' : ''}

## 사용자 수정 요청
${safeInstruction}

## 원본 글
${originalContent}

위 수정 요청을 반영한 전체 글을 출력하세요. 수정된 부분만이 아니라 전체 글을 출력해야 합니다.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 8192,
        temperature: 0.7,
        messages: [
          { role: 'user', content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      console.error('Claude revise error:', await response.text());
      return NextResponse.json({ error: '수정에 실패했습니다.' }, { status: 500 });
    }

    const data = await response.json();
    const generatedText = data.content?.[0]?.text || '';

    if (!generatedText) {
      return NextResponse.json({ error: '수정된 텍스트가 없습니다.' }, { status: 500 });
    }

    // 후처리 필터
    let filteredText = filterMedicalTerms(generatedText);
    filteredText = filterForeignWords(filteredText);
    filteredText = filterListBullets(filteredText, isRegulatedBusiness);
    filteredText = filterBannedWords(filteredText);
    if (isRegulatedBusiness) {
      filteredText = filterFirstPerson(filteredText);
    }

    return NextResponse.json({ content: filteredText });
  } catch (error) {
    console.error('Revise error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
