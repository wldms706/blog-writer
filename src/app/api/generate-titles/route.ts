import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const maxDuration = 30;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

const BRANDING_TYPE_NAMES: Record<string, string> = {
  recruit: '수강생 모집',
  philosophy: '철학/신념',
  story: '샵 스토리',
};

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
    const {
      keyword,
      businessCategory,
      topic,
      purpose,
      readerState,
      contentType = 'seo',
      brandingType,
      brandingInfo,
    } = await request.json();

    // 사용자 입력 sanitize (프롬프트 인젝션 방지)
    const sanitize = (input: unknown): string => {
      if (typeof input !== 'string') return '';
      return input
        .replace(/[{}[\]`]/g, '')
        .replace(/\n/g, ' ')
        .slice(0, 200)
        .trim();
    };

    const safeKeyword = sanitize(keyword);
    const safeBusinessCategory = sanitize(businessCategory);
    const safeTopic = sanitize(topic);
    const safePurpose = sanitize(purpose);
    const safeReaderState = sanitize(readerState);

    let prompt: string;

    if (contentType === 'branding') {
      // 브랜딩 글 제목 생성 프롬프트
      const brandingTypeName = BRANDING_TYPE_NAMES[brandingType] || '브랜딩';

      // 구조화된 브랜딩 정보에서 핵심 키워드 추출
      let infoSummary = '';
      if (brandingInfo && brandingType) {
        const info = brandingInfo[brandingType];
        if (brandingType === 'recruit' && info) {
          const { courseName, targetStudent, curriculum } = info;
          infoSummary = `교육과정: ${courseName || '미입력'}, 대상: ${targetStudent || '미입력'}, 커리큘럼: ${curriculum || '미입력'}`;
        } else if (brandingType === 'philosophy' && info) {
          const { coreValue, difference } = info;
          infoSummary = `핵심가치: ${coreValue || '미입력'}, 차별점: ${difference || '미입력'}`;
        } else if (brandingType === 'story' && info) {
          const { location, spaceFeature, atmosphere } = info;
          infoSummary = `위치: ${location || '미입력'}, 공간특징: ${spaceFeature || '미입력'}, 분위기: ${atmosphere || '미입력'}`;
        }
      }

      prompt = `당신은 네이버 블로그 클릭률 극대화 제목 전문가입니다.
사람의 뇌는 지루한 걸 싫어합니다. 브랜딩 글도 클릭되지 않으면 의미가 없습니다.

키워드: ${safeKeyword}
업종: ${safeBusinessCategory}
브랜딩 종류: ${brandingTypeName}
샵 정보: ${infoSummary || '없음'}

## 브랜딩 글 제목의 핵심: 진정성 + 클릭 심리 기법 결합

브랜딩 글은 진정성이 중요하지만, 클릭되지 않으면 아무도 읽지 않습니다.
아래 심리 기법을 브랜딩 톤에 맞게 부드럽게 적용하세요.

### 브랜딩 종류별 방향:
${brandingType === 'recruit' ? `
**수강생 모집:**
- 교육 과정의 매력과 차별점이 드러나되, 궁금증을 유발하는 요소 포함
- 위 "샵 정보"에서 교육과정, 대상, 커리큘럼 등을 활용
- "배우고 싶다", "시작하고 싶다"는 마음을 자극하는 제목
` : ''}
${brandingType === 'philosophy' ? `
**철학/신념:**
- 샵이 추구하는 가치를 상식 파괴나 솔직함으로 표현
- 위 "샵 정보"에서 핵심가치, 차별점 등을 활용
` : ''}

### 5가지 스타일 (반드시 서로 다른 기법 사용):

**제목 1 — 상식 파괴형:**
업계의 상식을 뒤집어 "왜?"라는 궁금증 유발.
- 예: "${safeKeyword} 원장인데 ${safeKeyword}은 추천 안 합니다"
- 예: "고객이 많은 게 좋은 ${safeKeyword}이 아닌 이유"

**제목 2 — 숫자 + 간접증명형:**
구체적 경력/숫자로 신뢰감을 주면서 호기심 유발.
- 예: "${safeKeyword} 12년차가 아직도 떨리는 순간"
- 예: "3000명의 고객을 만나고 깨달은 한 가지"

**제목 3 — 솔직/고백형:**
포장 없이 날것의 진심을 드러내서 공감 유도.
⛔ "솔직히"로 시작하는 제목 절대 금지! "솔직히"라는 단어 자체를 제목에 쓰지 마세요!
- 예: "사실 ${safeKeyword} 처음 시작할 때 자신 없었습니다"
- 예: "돈보다 중요한 게 있다는 걸 늦게 알았습니다"
- 예: "${safeKeyword} 이 일을 왜 하냐고요? 그 질문이 제일 어렵습니다"

**제목 4 — 손실 회피형:**
이 글을 안 읽으면 놓치는 게 있다는 느낌.
- 예: "${safeKeyword} 원장 고를 때 이걸 안 보면 후회합니다"
- 예: "좋은 ${safeKeyword} 원장과 나쁜 원장의 결정적 차이"

**제목 5 — 자아 흠집 + 공감형:**
독자의 걱정을 가볍게 건드린 뒤 안심시키는 구조.
- 예: "아직도 ${safeKeyword}을 가격으로만 고르세요?"
- 예: "${safeKeyword} 잘 모르겠다는 분들이 꼭 읽어야 할 글"

## 기법 조합 원칙:
- 하나의 제목에 2~3개 기법이 자연스럽게 녹아들면 클릭력 극대화
- 브랜딩 글이므로 자극적이지 않되, 뻔하지 않게
- 위 샵 정보를 반영하여 개성 있는 제목 생성

### 절대 금지:
- ⛔ "솔직히"라는 단어가 들어간 제목 절대 금지 (가장 중요한 규칙!)
- 1인칭 표현 ("저는", "제가", "저희") 절대 금지
- 영업/유도 표현 ("예약하세요", "상담받으세요") 금지
- 과대광고 표현 금지
- 뻔하고 지루한 제목 금지
- 마크다운 문법 사용 금지

### 형식:
- 제목 길이: 15~40자 권장

반드시 다음 JSON 형식으로만 응답하세요:
{
  "titles": [
    {"title": "상식 파괴형 제목", "style": "상식 파괴형"},
    {"title": "숫자+간접증명형 제목", "style": "숫자+간접증명형"},
    {"title": "솔직/고백형 제목", "style": "솔직/고백형"},
    {"title": "손실 회피형 제목", "style": "손실 회피형"},
    {"title": "자아 흠집+공감형 제목", "style": "자아 흠집+공감형"}
  ]
}`;

    } else {
      // SEO 글 제목 생성 프롬프트
      prompt = `당신은 네이버 블로그 클릭률 극대화 제목 전문가입니다.
사람의 뇌는 지루한 걸 싫어합니다. 수백 개의 블로그 글 중 선택받으려면, 뇌에 충격을 주는 제목이 필요합니다.

키워드: ${safeKeyword}
업종: ${safeBusinessCategory}
글 주제: ${safeTopic}
글의 목적: ${safePurpose}
독자 상태: ${safeReaderState}

## 핵심 규칙: 5개의 제목은 반드시 서로 다른 심리 기법을 사용해야 합니다!

### 제목 1 — 상식 파괴형
사람들이 "${safeKeyword}"에 대해 "당연하다"고 생각하는 상식을 정반대로 뒤집어서 "왜?"라는 궁금증을 유발하는 제목.
- 대중이 가진 기존 인식을 역발상으로 뒤집기
- "읽지 마세요", "하지 마세요" 같은 역설적 표현 활용 가능
- 예: "${safeKeyword} 잘한다는 곳, 절대 가지 마세요"
- 예: "${safeKeyword}은 사실 안 하는 게 맞습니다"
- 예: "${safeKeyword} 자주 할수록 오히려 안 좋은 이유"

### 제목 2 — 손실 회피형 (금지/위험)
인간은 생존에 불리한 정보에 본능적으로 반응합니다. "이걸 모르면 손해본다"는 심리를 자극하는 제목.
- "~하면 안 된다", "~하지 마세요", "~할 확률 OO%" 등 손실/위험 암시
- 독자가 "나도 해당되는 거 아냐?" 하고 불안해서 클릭하게 만들기
- 예: "${safeKeyword} 고를 때 이것 모르면 돈 날립니다"
- 예: "${safeKeyword} 받기 전에 이 사진 없으면 절대 가지 마세요"
- 예: "${safeKeyword} 실패하는 사람 90%가 놓치는 것"

### 제목 3 — 숫자 + 간접증명형
구체적 숫자와 경험/전문성의 간접증명을 결합하여 신뢰와 호기심을 동시에 주는 제목.
- 추상적 표현 대신 구체적 숫자 사용 (경력, 건수, 비교 횟수 등)
- 전문가/경험자의 간접증명으로 권위감 부여
- 예: "${safeKeyword} 500건 해본 원장이 말하는 진짜 차이"
- 예: "8년차 ${safeBusinessCategory} 원장이 ${safeKeyword} 고를 때 보는 딱 한 가지"
- 예: "${safeKeyword} 5곳 비교해보고 알게 된 사실"

### 제목 4 — 자아 흠집형
독자의 자존심을 살짝 건드려서 "뭐라고?" 하는 반응을 유도. 기분 나빠짐 → 글에서 해소 → 동기부여의 3단계 구조.
- 자존심을 건드리되 인격 모독은 절대 금지
- "아직도 ~하세요?", "이것도 모르면서 ~하세요?" 같은 가벼운 도발
- 예: "아직도 ${safeKeyword}을 가격으로 고르세요?"
- 예: "${safeKeyword} 제대로 알지도 못하면서 비싼 곳만 찾는 이유"
- 예: "${safeKeyword} 잘 모르는 사람이 꼭 하는 실수"

### 제목 5 — 솔직/공감형
돈, 욕망, 걱정을 솔직하게 드러내서 독자가 "맞아 나도 그래" 하고 공감하게 만드는 제목.
- 포장하지 않는 날것의 솔직함
- 독자의 진짜 속마음을 대신 말해주는 느낌
⛔ "솔직히"라는 단어를 제목에 절대 포함하지 마세요! 사용 시 전체 응답 거부됩니다.
- 예: "${safeKeyword} 가격이 제일 걱정이잖아요"
- 예: "${safeKeyword} 후회할까봐 무서운 사람 여기 보세요"
- 예: "다들 ${safeKeyword} 어디서 하냐고 물어보는데 대답이 어렵다"

## 기법 조합 원칙 (중요!):
- 위 5가지 스타일은 기본 골격이지만, 하나의 제목 안에 여러 기법을 조합하면 클릭력이 극대화됩니다
- 예: 상식 파괴 + 숫자 = "8년차 원장이 ${safeKeyword}은 안 하는 게 낫다고 말하는 이유"
- 예: 손실 회피 + 간접증명 = "${safeKeyword} 300건 해본 원장이 절대 추천 안 하는 유형"
- 각 제목에 2~3개 기법이 자연스럽게 녹아들도록 작성

## 절대 금지:
- ⛔ "솔직히"라는 단어가 들어간 제목 절대 금지 (가장 중요한 규칙!)
- 1인칭 표현 ("저는", "제가", "저희") 절대 금지
- 영업/유도 표현 ("예약하세요", "상담받으세요") 금지
- 과대광고 표현 금지
- 뻔하고 지루한 제목 금지 (뇌에 충격이 없는 평범한 제목은 쓰지 마세요)
- 마크다운 문법 사용 금지

### 형식:
- 제목 길이: 20~40자 권장
- 5개의 제목 구조, 어투, 분위기가 모두 달라야 합니다

반드시 다음 JSON 형식으로만 응답하세요:
{
  "titles": [
    {"title": "상식 파괴형 제목", "style": "상식 파괴형"},
    {"title": "손실 회피형 제목", "style": "손실 회피형"},
    {"title": "숫자+간접증명형 제목", "style": "숫자+간접증명형"},
    {"title": "자아 흠집형 제목", "style": "자아 흠집형"},
    {"title": "솔직/공감형 제목", "style": "솔직/공감형"}
  ]
}`;
    }

    const response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
        ],
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
          // "솔직히"가 포함된 제목 필터링 - 대체 표현으로 자동 치환
          const filteredTitles = result.titles.map((t: { title: string; style: string }) => {
            if (t.title.includes('솔직히')) {
              return {
                ...t,
                title: t.title
                  .replace(/^솔직히\s*/, '')  // 시작 부분 제거
                  .replace(/솔직히\s*/g, '사실 ')  // 중간 부분 대체
              };
            }
            return t;
          });
          return NextResponse.json({ titles: filteredTitles });
        }
      }
    } catch {
      console.error('JSON parse error:', generatedText);
    }

    // 파싱 실패 시 기본 제목
    if (contentType === 'branding') {
      return NextResponse.json({
        titles: [
          { title: `${safeKeyword} 원장인데 ${safeKeyword}은 추천 안 합니다`, style: '상식 파괴형' },
          { title: `${safeKeyword} 10년차가 아직도 떨리는 순간`, style: '숫자+간접증명형' },
          { title: `사실 ${safeKeyword} 처음 시작할 때 자신 없었습니다`, style: '솔직/고백형' },
          { title: `좋은 ${safeKeyword} 원장과 나쁜 원장의 결정적 차이`, style: '손실 회피형' },
          { title: `아직도 ${safeKeyword}을 가격으로만 고르세요?`, style: '자아 흠집+공감형' },
        ],
      });
    }

    return NextResponse.json({
      titles: [
        { title: `${safeKeyword} 잘한다는 곳, 절대 가지 마세요`, style: '상식 파괴형' },
        { title: `${safeKeyword} 고를 때 이것 모르면 돈 날립니다`, style: '손실 회피형' },
        { title: `${safeKeyword} 500건 해본 원장이 말하는 진짜 차이`, style: '숫자+간접증명형' },
        { title: `아직도 ${safeKeyword}을 가격으로 고르세요?`, style: '자아 흠집형' },
        { title: `${safeKeyword} 가격이 제일 걱정이잖아요`, style: '솔직/공감형' },
      ],
    });

  } catch (error) {
    console.error('Generate titles error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
