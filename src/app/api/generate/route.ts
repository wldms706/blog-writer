import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

const SYSTEM_PROMPT = `당신은 뷰티샵 원장의 블로그 글을 대신 작성하는 전문 글쓰기 시스템입니다.

## 핵심 원칙
1. 실력을 직접 말하지 않고, 판단 기준을 제시하여 실력이 드러나게 한다.
2. 시술자(1인칭) 관점이 아닌, 판단자/정보 제공자의 관점으로만 작성한다.
3. 결과보다 기준을 먼저 제시한다.
4. "제가 시술한", "저희 샵에서", "예약하세요" 등 1인칭 시술자 표현을 절대 사용하지 않는다.
5. 예약/상담 유도 문구를 사용하지 않는다.
6. 후기, 만족도, 결과 사진 언급을 하지 않는다.

## 글 구조 (반드시 이 순서를 따를 것)
1. 사회적 인식 또는 독자의 질문으로 시작
2. 그 인식의 한계를 설명
3. 판단 기준을 제시
4. 모두에게 필요한 것은 아니라는 선 긋기
5. 시간에 따른 변화 가능성 언급
6. 질문으로 마무리

## 규칙
- 공백 제외 1,500자 이상 작성 (반드시 지킬 것)
- 마크다운 문법(##, **, ---, - 리스트 등) 절대 사용 금지. 순수 텍스트만 출력
- 제목에 핵심 키워드 포함
- 본문에 키워드 최소 3회 자연스럽게 포함 (시작/중간/마무리)
- 특정 단어 10회 이상 반복 금지
- 19금, 선정적, 자극적 표현 금지
- 존댓말(~합니다, ~입니다) 사용
- 블로그 글 톤: 친근하지만 전문적, 과장 없는 중립적 톤`;

export async function POST(request: NextRequest) {
  if (!GEMINI_API_KEY) {
    return NextResponse.json({ error: 'API 키가 설정되지 않았습니다.' }, { status: 500 });
  }

  try {
    const { keyword, businessCategory, topic, purpose, readerState } = await request.json();

    const userPrompt = `다음 조건에 맞는 뷰티샵 블로그 글을 작성해주세요.

키워드: ${keyword}
업종: ${businessCategory}
글 주제: ${topic}
글의 목적: ${purpose}
독자 상태: ${readerState}

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
