import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkAndIncrementUsage } from '@/lib/usage';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

const SEO_SYSTEM_PROMPT = `당신은 뷰티 정보를 제공하는 전문 블로그 글 작성 시스템입니다.

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
- 제목에 핵심 키워드 반드시 포함
- 특정 단어 10회 이상 반복 금지
- 존댓말(~합니다, ~입니다) 사용

## ⚠️ 키워드 배치 규칙 (필수)
핵심 키워드는 본문에 반드시 3회 이상 자연스럽게 포함해야 합니다:
1. **처음**: 본문 시작 후 첫 2~3문장 이내에 키워드 1회 언급
2. **중간**: 본문 중간 부분에서 키워드 1회 언급
3. **마지막**: 본문 끝나기 전 마지막 2~3문장 이내에 키워드 1회 언급

예시 (키워드: "역삼동눈썹문신"):
- 처음: "역삼동눈썹문신을 고민하시는 분들이 많습니다..."
- 중간: "...좋은 역삼동눈썹문신 샵을 고르는 기준은..."
- 마지막: "...역삼동눈썹문신을 선택할 때 이런 점들을 꼭 확인해보세요."`;

const BRANDING_SYSTEM_PROMPT = `당신은 뷰티 샵의 브랜딩 글을 작성하는 전문 시스템입니다.

## ⚠️ 절대 금지 표현 (이 규칙을 어기면 글이 비공개 처리됩니다)

### 1인칭 표현 절대 금지:
- "저는", "제가", "저희", "나는", "내가" 사용 금지
- "저희 샵", "저희 매장", "우리 샵" 사용 금지
- "제가 시술한", "제가 추천하는" 사용 금지
- "저만의 노하우", "제 경험상" 사용 금지

### 영업/유도 표현 금지:
- "예약하세요", "문의주세요", "상담받으세요" 금지
- "방문해보세요", "찾아와주세요" 금지
- "지금 바로", "서두르세요" 금지

### 과대광고 금지:
- "최고의", "1등", "완벽한" 등 금지
- "결과 보장", "효과 확실" 등 금지

## 브랜딩 글 작성 관점
- 스토리텔링 형식으로 작성
- 진정성 있고 따뜻한 톤 유지
- 샵의 가치와 철학이 자연스럽게 드러나도록 작성
- 3인칭 관찰자 시점 또는 일반적인 이야기 형식 사용
- 예: "이곳에서는", "이 샵의 특별한 점은", "OO원장은" 등

## 형식 규칙
- 공백 제외 1,500자 이상 필수
- 마크다운(##, **, ---, 리스트 기호) 절대 금지, 순수 텍스트만
- 제목에 핵심 키워드 반드시 포함
- 특정 단어 10회 이상 반복 금지
- 존댓말(~합니다, ~입니다) 사용

## ⚠️ 키워드 배치 규칙 (필수)
핵심 키워드는 본문에 반드시 3회 이상 자연스럽게 포함해야 합니다:
1. **처음**: 본문 시작 후 첫 2~3문장 이내에 키워드 1회 언급
2. **중간**: 본문 중간 부분에서 키워드 1회 언급
3. **마지막**: 본문 끝나기 전 마지막 2~3문장 이내에 키워드 1회 언급`;

const BRANDING_TYPE_NAMES: Record<string, string> = {
  intro: '자기소개',
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

  // 사용량 체크
  const usage = await checkAndIncrementUsage(user.id);
  if (!usage.allowed) {
    return NextResponse.json(
      { error: '오늘의 무료 생성 횟수(3회)를 모두 사용했습니다.', remaining: 0 },
      { status: 403 },
    );
  }

  try {
    const {
      keyword,
      businessCategory,
      topic,
      purpose,
      readerState,
      selectedTitle,
      contentType = 'seo',
      brandingType,
      brandingInfo,
    } = await request.json();

    // 규제 업종 여부 확인
    const isRegulatedBusiness = businessCategory === 'semi-permanent' || businessCategory === '반영구';

    let systemPrompt: string;
    let userPrompt: string;

    if (contentType === 'branding') {
      // 브랜딩 글 생성
      systemPrompt = BRANDING_SYSTEM_PROMPT;
      const brandingTypeName = BRANDING_TYPE_NAMES[brandingType] || '브랜딩';

      // 구조화된 브랜딩 정보를 상세 텍스트로 변환
      let detailedInfo = '';
      if (brandingInfo && brandingType) {
        const info = brandingInfo[brandingType];
        if (brandingType === 'intro' && info) {
          const { experience, specialty, startReason, customerMind } = info;
          detailedInfo = `
## 원장님 정보 (이 정보를 바탕으로 글을 작성하세요)
- 경력: ${experience || '미입력'}
- 전문 분야: ${specialty || '미입력'}
- 이 일을 시작한 계기: ${startReason || '미입력'}
- 고객을 대하는 마음: ${customerMind || '미입력'}`;
        } else if (brandingType === 'philosophy' && info) {
          const { coreValue, difference, whyPhilosophy, message } = info;
          detailedInfo = `
## 샵의 철학/신념 (이 정보를 바탕으로 글을 작성하세요)
- 가장 중요한 가치: ${coreValue || '미입력'}
- 다른 샵과 다른 점: ${difference || '미입력'}
- 그런 철학을 갖게 된 이유: ${whyPhilosophy || '미입력'}
- 고객에게 전하고 싶은 메시지: ${message || '미입력'}`;
        } else if (brandingType === 'story' && info) {
          const { location, startTime, spaceFeature, atmosphere } = info;
          detailedInfo = `
## 샵 정보 (이 정보를 바탕으로 글을 작성하세요)
- 위치/동네: ${location || '미입력'}
- 시작 시기: ${startTime || '미입력'}
- 공간 특징: ${spaceFeature || '미입력'}
- 분위기: ${atmosphere || '미입력'}`;
        }
      }

      userPrompt = `다음 조건에 맞는 뷰티 브랜딩 블로그 글을 작성해주세요.

키워드: ${keyword}
업종: ${businessCategory}
브랜딩 종류: ${brandingTypeName}
${selectedTitle ? `제목: ${selectedTitle}` : ''}
${detailedInfo}

## 브랜딩 종류별 글 구조

${brandingType === 'intro' ? `
### 자기소개 글 구조:
1. 이 일을 시작하게 된 계기나 배경으로 시작 (위 정보의 "이 일을 시작한 계기" 활용)
2. 경력과 전문 분야 소개 (위 정보의 "경력", "전문 분야" 활용)
3. 어떤 마음으로 고객을 대하는지 (위 정보의 "고객을 대하는 마음" 활용)
4. 앞으로의 다짐이나 메시지로 마무리
- 주의: 1인칭 대신 "OO원장은", "이곳의 원장은" 등 3인칭 사용
- 입력된 정보를 자연스럽게 문장으로 풀어서 작성
` : ''}

${brandingType === 'philosophy' ? `
### 철학/신념 글 구조:
1. 업계의 일반적인 현상이나 트렌드 언급
2. 이 샵이 다르게 생각하는 점 (위 정보의 "다른 샵과 다른 점" 활용)
3. 왜 그런 철학을 갖게 되었는지 (위 정보의 "그런 철학을 갖게 된 이유" 활용)
4. 가장 중요하게 생각하는 가치 (위 정보의 "가장 중요한 가치" 활용)
5. 마무리 메시지 (위 정보의 "고객에게 전하고 싶은 메시지" 활용)
- 주의: "이 샵에서는", "이곳의 철학은" 등 객관적 시점 사용
- 입력된 정보를 자연스럽게 문장으로 풀어서 작성
` : ''}

${brandingType === 'story' ? `
### 샵 스토리 글 구조:
1. 샵의 위치나 공간 분위기 묘사로 시작 (위 정보의 "위치/동네", "분위기" 활용)
2. 샵이 시작된 이야기 (위 정보의 "시작 시기" 활용)
3. 공간의 특별한 점이나 분위기 (위 정보의 "공간 특징" 활용)
4. 이곳에서 경험할 수 있는 것
5. 마무리 메시지
- 주의: 공간을 설명하는 관찰자 시점으로 작성
- 입력된 정보를 자연스럽게 문장으로 풀어서 작성
` : ''}

⚠️ 중요 규칙:
- "저는", "제가", "저희" 등 1인칭 표현 절대 금지
- "예약하세요", "상담받으세요" 등 영업 표현 금지
- 진정성 있고 따뜻한 톤으로 작성
- 위에 제공된 정보를 최대한 활용하여 구체적이고 개성 있는 글 작성

${selectedTitle ? `제목은 "${selectedTitle}"을 그대로 사용하세요.` : '제목을 첫 줄에 쓰고,'} 한 줄 띄운 후 본문을 작성해주세요.

⚠️ 키워드 "${keyword}" 배치 필수:
1. 본문 시작 부분 (첫 2~3문장 이내)에 "${keyword}" 1회 언급
2. 본문 중간 부분에 "${keyword}" 1회 언급
3. 본문 마지막 부분 (끝 2~3문장 이내)에 "${keyword}" 1회 언급

마크다운 문법(##, **, ---, 리스트 기호 등)을 절대 사용하지 마세요. 순수 텍스트로만 작성하세요.
공백 제외 1,500자 이상 반드시 작성하세요.`;

    } else {
      // SEO 글 생성 (기존)
      systemPrompt = SEO_SYSTEM_PROMPT;

      userPrompt = `다음 조건에 맞는 뷰티 정보 블로그 글을 작성해주세요.

키워드: ${keyword}
업종: ${businessCategory}
글 주제: ${topic}
글의 목적: ${purpose}
독자 상태: ${readerState}
${selectedTitle ? `제목: ${selectedTitle}` : ''}

${isRegulatedBusiness ? `
⚠️ 중요: 이 글은 "반영구" 업종입니다. 반드시 다음 규칙을 지켜주세요:
- "저는", "제가", "저희" 등 1인칭 표현 절대 금지 (비공개 처리됨)
- "저는 이런 원장입니다", "제가 시술합니다" 등 시술자 관점 금지
- 정보를 제공하는 안내자 관점으로만 작성
- 예: "좋은 샵을 고르려면 ~를 확인해보세요" (O)
- 예: "저는 이런 기준으로 시술합니다" (X - 절대 금지)
` : ''}

위 조건을 반영하여, 시스템 규칙을 준수하는 블로그 글을 작성해주세요.
${selectedTitle ? `제목은 "${selectedTitle}"을 그대로 사용하세요.` : '제목을 첫 줄에 쓰고,'} 한 줄 띄운 후 본문을 작성해주세요.

⚠️ 키워드 "${keyword}" 배치 필수:
1. 본문 시작 부분 (첫 2~3문장 이내)에 "${keyword}" 1회 언급
2. 본문 중간 부분에 "${keyword}" 1회 언급
3. 본문 마지막 부분 (끝 2~3문장 이내)에 "${keyword}" 1회 언급

마크다운 문법(##, **, ---, 리스트 기호 등)을 절대 사용하지 마세요. 순수 텍스트로만 작성하세요.
공백 제외 1,500자 이상 반드시 작성하세요.`;
    }

    const response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemPrompt }],
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
