import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkAndIncrementUsage } from '@/lib/usage';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

const SYSTEM_PROMPT = `당신은 뷰티 정보를 제공하는 전문 블로그 글 작성 시스템입니다.

## ⚠️ 절대 금지 표현 (이 규칙을 어기면 글이 비공개 처리됩니다)

### 1인칭 표현 절대 금지:
- "저는", "제가", "저희", "나는", "내가" 사용 금지
- "저희 샵", "저희 매장", "우리 샵" 사용 금지
- "제가 시술한", "제가 추천하는" 사용 금지
- "저만의 노하우", "제 경험상" 사용 금지

### 시술자/원장 관점 표현 금지:
- "직접 시술해드립니다" 금지
- "저는 이런 기준으로 시술합니다" 금지
- "저는 ~한 원장입니다" 금지
- "제 실력", "제 경력" 언급 금지

### 영업/유도 표현 금지:
- "예약하세요", "문의주세요", "상담받으세요" 금지
- "방문해보세요", "찾아와주세요" 금지
- "지금 바로", "서두르세요" 금지

### 결과/후기 언급 금지:
- "고객님들이 만족하셨습니다" 금지
- "결과가 좋았습니다" 금지
- "후기가 좋습니다" 금지

## 글쓰기 관점
- 시술자가 아닌 "정보 전달자/안내자"의 관점으로 작성
- "~하는 것이 좋습니다", "~를 확인해보세요" 등 일반적인 조언 형태로 작성
- "좋은 샵을 고르려면", "선택할 때는" 등 제3자 관점 유지

## 글 구조
1. 독자의 궁금증이나 사회적 인식으로 시작
2. 그 인식의 한계 설명
3. 판단 기준 제시 (어떻게 좋은 곳을 고를 수 있는지)
4. 모두에게 필요한 것은 아니라는 선 긋기
5. 시간/상황에 따라 달라질 수 있음 언급
6. 질문으로 마무리

## 형식 규칙
- 공백 제외 1,500자 이상 필수
- 마크다운(##, **, ---, 리스트 기호) 절대 금지, 순수 텍스트만
- 제목에 핵심 키워드 포함
- 본문에 키워드 3회 이상 자연스럽게 포함
- 특정 단어 10회 이상 반복 금지
- 존댓말(~합니다, ~입니다) 사용`;

export async function POST(request: NextRequest) {
  if (!GEMINI_API_KEY) {
    return NextResponse.json({ error: 'API 키가 설정되지 않았습니다.' }, { status: 500 });
  }

  // 인증 확인
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  // 사용량 체크
  const usage = await checkAndIncrementUsage(user.id);
  if (!usage.allowed) {
    return NextResponse.json(
      { error: '오늘의 무료 생성 횟수(3회)를 모두 사용했습니다.', remaining: 0 },
      { status: 403 },
    );
  }

  try {
    const { keyword, businessCategory, topic, purpose, readerState } = await request.json();

    // 규제 업종 여부 확인
    const isRegulatedBusiness = businessCategory === 'semi-permanent';

    const userPrompt = `다음 조건에 맞는 뷰티 정보 블로그 글을 작성해주세요.

키워드: ${keyword}
업종: ${businessCategory}
글 주제: ${topic}
글의 목적: ${purpose}
독자 상태: ${readerState}

${isRegulatedBusiness ? `
⚠️ 중요: 이 글은 "반영구" 업종입니다. 반드시 다음 규칙을 지켜주세요:
- "저는", "제가", "저희" 등 1인칭 표현 절대 금지 (비공개 처리됨)
- "저는 이런 원장입니다", "제가 시술합니다" 등 시술자 관점 금지
- 정보를 제공하는 안내자 관점으로만 작성
- 예: "좋은 샵을 고르려면 ~를 확인해보세요" (O)
- 예: "저는 이런 기준으로 시술합니다" (X - 절대 금지)
` : ''}

위 조건을 반영하여, 시스템 규칙을 준수하는 블로그 글을 작성해주세요.
제목을 첫 줄에 쓰고, 한 줄 띄운 후 본문을 작성해주세요.
마크다운 문법(##, **, ---, 리스트 기호 등)을 절대 사용하지 마세요. 순수 텍스트로만 작성하세요.
공백 제외 1,500자 이상 반드시 작성하세요.`;

    const response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: SYSTEM_PROMPT }],
        },
        contents: [
          {
            role: 'user',
            parts: [{ text: userPrompt }],
          },
        ],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 4096,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini API error:', errorData);

      if (response.status === 429) {
        return NextResponse.json(
          { error: 'API 사용량 한도를 초과했습니다. 잠시 후 다시 시도해주세요.' },
          { status: 429 },
        );
      }

      return NextResponse.json({ error: 'AI 생성에 실패했습니다.' }, { status: 500 });
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!generatedText) {
      return NextResponse.json({ error: '생성된 텍스트가 없습니다.' }, { status: 500 });
    }

    return NextResponse.json({ content: generatedText });
  } catch (error) {
    console.error('Generate error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
