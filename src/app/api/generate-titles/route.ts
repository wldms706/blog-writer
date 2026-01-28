import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

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

  try {
    const { keyword, businessCategory, topic, purpose, readerState } = await request.json();

    const prompt = `당신은 네이버 블로그 제목 전문가입니다. 클릭률을 높이는 제목을 만들어주세요.

키워드: ${keyword}
업종: ${businessCategory}
글 주제: ${topic}
글의 목적: ${purpose}
독자 상태: ${readerState}

## 제목 작성 규칙

### 필수 요소:
1. **궁금증 유발**: 독자가 "이게 뭐지?" 하고 클릭하게 만들기
2. **수치화**: 구체적인 숫자를 포함 (예: "3가지", "90%", "5분만에")
3. **자극적 단어**: "충격", "실수", "후회", "비밀", "진짜", "반전" 등 사용

### 제목 스타일 예시:
- "눈썹문신 하기 전 모르면 후회하는 3가지 진실"
- "피부관리사가 절대 안 알려주는 모공관리 비밀"
- "10명 중 9명이 실수하는 반영구 선택법"
- "망한 눈썹 90% 이 실수 때문이었다"
- "이것만 알았어도 돈 안 버렸다... 솔직한 시술 후기"

### 금지 사항:
- 1인칭 표현 ("저는", "제가", "저희") 절대 금지
- 영업/유도 표현 ("예약하세요", "상담받으세요") 금지
- 과대광고 표현 금지

### 형식:
- 마크다운 문법 사용 금지
- 제목 길이: 20~40자 권장

반드시 다음 JSON 형식으로만 응답하세요:
{
  "titles": [
    {"title": "제목1", "style": "스타일 설명"},
    {"title": "제목2", "style": "스타일 설명"},
    {"title": "제목3", "style": "스타일 설명"}
  ]
}`;

    const response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!response.ok) {
      console.error('Gemini API error:', await response.text());
      return NextResponse.json({ error: 'AI 제목 생성에 실패했습니다.' }, { status: 500 });
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // JSON 파싱
    try {
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        if (result.titles && Array.isArray(result.titles)) {
          return NextResponse.json({ titles: result.titles });
        }
      }
    } catch {
      console.error('JSON parse error:', generatedText);
    }

    // 파싱 실패 시 기본 제목
    return NextResponse.json({
      titles: [
        { title: `${keyword} 전문가가 알려주는 숨은 비밀 3가지`, style: '비밀 공개형' },
        { title: `${keyword} 하기 전 꼭 알아야 할 실수 TOP 5`, style: '실수 방지형' },
        { title: `90%가 모르는 ${keyword} 선택 기준`, style: '수치 강조형' },
      ],
    });

  } catch (error) {
    console.error('Generate titles error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
