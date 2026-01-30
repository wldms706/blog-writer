import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkAndIncrementUsage } from '@/lib/usage';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

// 다양한 글 구조 템플릿 (SEO 최적화를 위해 랜덤 선택)
const ARTICLE_STRUCTURES = [
  {
    name: '질문-답변형',
    structure: `## 글 구조 (질문-답변형)
독자가 가질 수 있는 질문을 던지고 차근차근 답변하는 형태로 작성합니다.
- 도입: 많은 사람들이 궁금해하는 질문 제시
- 전개: 그 질문에 대한 배경 설명
- 핵심: 실질적인 답변과 설명
- 심화: 추가로 알아두면 좋은 정보
- 마무리: 핵심 내용 요약과 실천 제안`,
  },
  {
    name: '오해-진실형',
    structure: `## 글 구조 (오해-진실형)
흔히 잘못 알려진 정보를 바로잡는 형태로 작성합니다.
- 도입: 널리 퍼진 오해나 잘못된 상식 언급
- 문제제기: 왜 그런 오해가 생겼는지 배경 설명
- 진실: 실제로는 어떤지 정확한 정보 제공
- 근거: 왜 그런지 이유와 원리 설명
- 마무리: 올바른 판단을 위한 조언`,
  },
  {
    name: '비교-분석형',
    structure: `## 글 구조 (비교-분석형)
여러 선택지를 비교하며 각각의 장단점을 분석하는 형태로 작성합니다.
- 도입: 선택의 기로에 선 상황 묘사
- 옵션 소개: 가능한 선택지들 나열
- 분석: 각 옵션의 특징과 차이점 설명
- 기준 제시: 어떤 상황에 어떤 선택이 맞는지
- 마무리: 본인 상황에 맞게 판단하도록 안내`,
  },
  {
    name: '상황별-가이드형',
    structure: `## 글 구조 (상황별-가이드형)
다양한 상황에 따라 다른 접근이 필요함을 설명하는 형태로 작성합니다.
- 도입: 상황마다 다른 접근이 필요한 이유
- 상황1: 특정 조건일 때 고려할 점
- 상황2: 다른 조건일 때 고려할 점
- 공통 기준: 어떤 상황에서든 중요한 핵심 요소
- 마무리: 자신의 상황을 파악하는 것이 먼저임을 강조`,
  },
  {
    name: '스토리텔링형',
    structure: `## 글 구조 (스토리텔링형)
구체적인 사례나 시나리오를 통해 정보를 전달하는 형태로 작성합니다.
- 도입: 흔히 겪을 수 있는 상황 묘사
- 고민: 그 상황에서 느끼는 불안이나 의문
- 탐색: 정보를 찾아가는 과정
- 발견: 핵심 인사이트나 기준 발견
- 마무리: 비슷한 고민을 가진 독자에게 도움이 되길`,
  },
  {
    name: '체크포인트형',
    structure: `## 글 구조 (체크포인트형)
확인해야 할 중요 사항들을 자연스럽게 설명하는 형태로 작성합니다.
- 도입: 왜 꼼꼼히 살펴봐야 하는지 배경 설명
- 핵심1: 가장 중요한 확인 사항과 그 이유
- 핵심2: 놓치기 쉬운 부분과 그 중요성
- 핵심3: 전문가들이 강조하는 포인트
- 마무리: 종합적으로 판단하는 방법 안내`,
  },
];

// 랜덤 글 구조 선택 함수
function getRandomArticleStructure(): string {
  const randomIndex = Math.floor(Math.random() * ARTICLE_STRUCTURES.length);
  const selected = ARTICLE_STRUCTURES[randomIndex];
  return selected.structure;
}

// 주요 시/구 이름 목록 (큰 키워드 판단용)
const LARGE_REGIONS = [
  // 특별시/광역시
  '서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종',
  // 경기도 시
  '수원', '성남', '고양', '용인', '부천', '안산', '안양', '남양주', '화성', '평택', '의정부', '시흥', '파주', '김포', '광명', '광주', '군포', '하남', '오산', '이천', '안성', '의왕', '양주', '포천', '여주', '동두천', '과천', '구리', '양평',
  // 서울 구
  '강남', '서초', '송파', '강동', '마포', '용산', '성동', '광진', '동대문', '중랑', '성북', '강북', '도봉', '노원', '은평', '서대문', '종로', '중구', '영등포', '동작', '관악', '금천', '구로', '양천', '강서',
  // 기타 주요 도시
  '천안', '청주', '전주', '포항', '창원', '김해', '제주', '춘천', '원주', '강릉', '목포', '순천', '여수', '군산', '익산', '경주', '구미', '안동', '진주', '통영', '거제', '양산',
];

// 키워드 크기 판단 함수 (시/구 단위 = 큰 키워드)
function isLargeKeyword(keyword: string): boolean {
  // 키워드에 시/구 이름이 포함되어 있고, "동"으로 끝나지 않으면 큰 키워드
  const hasLargeRegion = LARGE_REGIONS.some(region => keyword.includes(region));
  const endsWithDong = /동(?:눈썹|피부|네일|헤어|메이크업|왁싱|속눈썹|두피|탈모|반영구|문신|시술|관리|샵|아트|펌|연장)/.test(keyword) || keyword.match(/[가-힣]+동[가-힣]*$/);

  // 큰 지역 이름이 있고, 동으로 끝나지 않으면 큰 키워드
  if (hasLargeRegion && !endsWithDong) {
    return true;
  }

  // "시" 또는 "구"로 끝나는 패턴 체크
  if (/[가-힣]+(시|구)[가-힣]*/.test(keyword) && !endsWithDong) {
    return true;
  }

  return false;
}

const SEO_BASE_PROMPT = `당신은 뷰티 정보를 제공하는 전문 블로그 글 작성 시스템입니다.

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

### ⚠️ 나열식 표현 자제:
- "첫째, 둘째, 셋째" 패턴 사용 자제
- "첫 번째, 두 번째" 패턴 사용 자제
- 번호를 붙여 나열하는 방식 대신 자연스러운 문장 흐름으로 작성
- 단락을 나눠 각 주제를 설명하되, 기계적인 나열은 피하기

## 글쓰기 관점
- 시술자가 아닌 "정보 전달자/안내자"의 관점으로 작성
- "~하는 것이 좋습니다", "~를 확인해보세요" 등 일반적인 조언 형태로 작성
- "좋은 샵을 고르려면", "선택할 때는" 등 제3자 관점 유지

## 형식 규칙
- 공백 제외 1,500자 이상 필수
- 마크다운(##, **, ---, 리스트 기호) 절대 금지, 순수 텍스트만
- 제목에 핵심 키워드 반드시 포함
- 특정 단어 10회 이상 반복 금지
- 존댓말(~합니다, ~입니다) 사용

## ⚠️ 키워드 배치 규칙 (필수)
핵심 키워드는 본문에 반드시 3회 이상 자연스럽게 포함해야 합니다:
1. 처음: 본문 시작 후 첫 2~3문장 이내에 키워드 1회 언급
2. 중간: 본문 중간 부분에서 키워드 1회 언급
3. 마지막: 본문 끝나기 전 마지막 2~3문장 이내에 키워드 1회 언급

예시 (키워드: "역삼동눈썹문신"):
- 처음: "역삼동눈썹문신을 고민하시는 분들이 많습니다..."
- 중간: "...좋은 역삼동눈썹문신 샵을 고르는 기준은..."
- 마지막: "...역삼동눈썹문신을 선택할 때 이런 점들을 꼭 확인해보세요."`;

// 일반 업종용 브랜딩 프롬프트 (1인칭 허용)
const BRANDING_GENERAL_PROMPT = `당신은 뷰티 샵의 브랜딩 글을 작성하는 전문 시스템입니다.

## 브랜딩 글 특성
브랜딩 글(자기소개, 철학, 샵 스토리)은 샵 운영자가 직접 자신의 이야기를 전하는 글입니다.

## ✅ 글쓰기 스타일
- 1인칭("저는", "제가") 자연스럽게 사용 가능
- 스토리와 정보가 자연스럽게 어우러지는 글
- 진솔하고 따뜻한 톤으로 자신의 이야기 전달
- 독자가 읽으면서 공감하고 신뢰가 쌓이는 글

## ⚠️ 금지 표현

### 어색한 3인칭 표현 금지:
- "이 샵의 원장은", "이 샵에서는" 금지 (자기소개인데 어색함)
- "이곳"이라는 표현 금지 (딱딱함)

### 영업/유도 표현 금지:
- "예약하세요", "문의주세요", "상담받으세요" 금지
- "방문해보세요", "찾아와주세요" 금지
- "지금 바로", "서두르세요" 금지

### 과대광고 금지:
- "최고의", "1등", "완벽한" 등 금지
- "결과 보장", "효과 확실" 등 금지

### 뻔한 AI 문체 금지:
- "저는 10년 경력의 전문가입니다" 같은 딱딱한 자기소개 금지
- "고객님의 아름다움을 위해 최선을 다하겠습니다" 같은 뻔한 멘트 금지`;

// 규제 업종(반영구)용 브랜딩 프롬프트 (1인칭 금지, 정보 중심)
const BRANDING_REGULATED_PROMPT = `당신은 뷰티 샵의 브랜딩 글을 작성하는 전문 시스템입니다.

## ⚠️ 중요: 규제 업종 (반영구/눈썹문신)
이 업종은 의료법 관련 규제가 있어 1인칭 표현과 시술 홍보에 주의가 필요합니다.
정보 전달 중심으로 작성하되, 샵의 전문성이 자연스럽게 드러나도록 합니다.

## ✅ 글쓰기 스타일
- 정보 전달이 메인이고, 그 안에 샵의 색깔이 자연스럽게 묻어나게
- 독자가 읽으면서 "아, 이건 몰랐네" 하고 얻어가는 게 있는 글
- 전문가의 인사이트가 담긴 정보성 글
- 읽고 나서 "이 샵 믿을 만하다"는 느낌이 들도록

## ⚠️ 금지 표현

### 1인칭 표현 금지:
- "저는", "제가", "저희" 사용 금지
- "제가 시술한", "저만의 노하우" 금지

### 어색한 3인칭 표현도 금지:
- "이 샵의 원장은", "이 샵에서는" 금지 (어색함)
- "이곳"이라는 표현 금지 (딱딱함)

### 영업/유도 표현 금지:
- "예약하세요", "문의주세요", "상담받으세요" 금지
- "방문해보세요", "찾아와주세요" 금지

### 과대광고 금지:
- "최고의", "1등", "완벽한" 등 금지
- "결과 보장", "효과 확실" 등 금지

### 뻔한 AI 문체 금지:
- "저는 10년 경력의 전문가입니다" 같은 자기자랑 나열 금지
- "고객님의 아름다움을 위해 최선을 다하겠습니다" 같은 뻔한 멘트 금지

## 형식 규칙 (필수)
- 공백 제외 1,500자 이상 필수
- ⚠️ 마크다운 절대 금지: ##, **, ***, ---, -, *, 1. 2. 3. 등 모든 마크다운 문법 사용 금지
- ⚠️ 별표(**) 강조 절대 금지: **단어** 이런 식으로 감싸지 마세요
- 제목에 핵심 키워드 반드시 포함
- 특정 단어 10회 이상 반복 금지
- 존댓말(~합니다, ~입니다) 사용
- 순수 텍스트로만 작성 (특수문자 강조 없이)

## ⚠️ 키워드 배치 규칙 (필수)
핵심 키워드는 본문에 반드시 3회 이상 자연스럽게 포함해야 합니다:
1. 처음: 본문 시작 후 첫 2~3문장 이내에 키워드 1회 언급
2. 중간: 본문 중간 부분에서 키워드 1회 언급
3. 마지막: 본문 끝나기 전 마지막 2~3문장 이내에 키워드 1회 언급`;

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
      // 브랜딩 글 생성 - 규제 업종(반영구)은 1인칭 금지, 나머지는 1인칭 허용
      systemPrompt = isRegulatedBusiness ? BRANDING_REGULATED_PROMPT : BRANDING_GENERAL_PROMPT;
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
${isRegulatedBusiness ? `- 주의: 규제 업종이므로 1인칭 금지. 정보 전달 중심으로 작성` : `- 1인칭("저는", "제가") 자연스럽게 사용하여 진솔한 자기소개 작성`}
- "이곳" 표현 금지 - "이 샵", "이 공간" 등으로 대체
- 입력된 정보를 자연스럽게 문장으로 풀어서 작성
` : ''}

${brandingType === 'philosophy' ? `
### 철학/신념 글 구조:
1. 업계의 일반적인 현상이나 트렌드 언급
2. 이 샵이 다르게 생각하는 점 (위 정보의 "다른 샵과 다른 점" 활용)
3. 왜 그런 철학을 갖게 되었는지 (위 정보의 "그런 철학을 갖게 된 이유" 활용)
4. 가장 중요하게 생각하는 가치 (위 정보의 "가장 중요한 가치" 활용)
5. 마무리 메시지 (위 정보의 "고객에게 전하고 싶은 메시지" 활용)
${isRegulatedBusiness ? `- 주의: 규제 업종이므로 1인칭 금지. 정보 전달 중심으로 작성` : `- 1인칭("저는", "제가") 사용하여 자신의 철학을 진솔하게 전달`}
- "이곳" 표현 금지 - "이 샵", "이 공간" 등으로 대체
- 입력된 정보를 자연스럽게 문장으로 풀어서 작성
` : ''}

${brandingType === 'story' ? `
### 샵 스토리 글 구조:
1. 샵의 위치나 공간 분위기 묘사로 시작 (위 정보의 "위치/동네", "분위기" 활용)
2. 샵이 시작된 이야기 (위 정보의 "시작 시기" 활용)
3. 공간의 특별한 점이나 분위기 (위 정보의 "공간 특징" 활용)
4. 이 샵에서 경험할 수 있는 것
5. 마무리 메시지
${isRegulatedBusiness ? `- 주의: 규제 업종이므로 1인칭 금지. 정보 전달 중심으로 작성` : `- 1인칭 사용하여 자신만의 공간 이야기를 진솔하게 전달`}
- "이곳" 표현 금지 - "이 샵", "이 공간" 등으로 대체
- 입력된 정보를 자연스럽게 문장으로 풀어서 작성
` : ''}

⚠️ 중요 규칙:
${isRegulatedBusiness ? `- "저는", "제가", "저희" 등 1인칭 표현 절대 금지 (규제 업종)` : `- 1인칭("저는", "제가") 자연스럽게 사용 가능`}
- "예약하세요", "상담받으세요" 등 영업 표현 금지
- "이곳" 표현 금지 → "이 샵", "이 공간" 등으로 대체
- 진정성 있고 따뜻한 톤으로 작성
- 위에 제공된 정보를 최대한 활용하여 구체적이고 개성 있는 글 작성

${selectedTitle ? `제목은 "${selectedTitle}"을 그대로 사용하세요.` : '제목을 첫 줄에 쓰고,'} 한 줄 띄운 후 본문을 작성해주세요.

⚠️ 키워드 "${keyword}" 배치 필수:
1. 본문 시작 부분 (첫 2~3문장 이내)에 "${keyword}" 1회 언급
2. 본문 중간 부분에 "${keyword}" 1회 언급
3. 본문 마지막 부분 (끝 2~3문장 이내)에 "${keyword}" 1회 언급

⚠️ 마크다운 절대 금지:
- ##, **, ***, ---, 리스트 기호(-, *, 1. 2. 3.) 등 모든 마크다운 문법 사용 금지
- **단어** 이런 식으로 별표로 감싸는 강조 절대 금지
- 순수 텍스트로만 작성하세요

공백 제외 1,500자 이상 반드시 작성하세요.`;

    } else {
      // SEO 글 생성 - 랜덤 글 구조 적용
      const randomStructure = getRandomArticleStructure();
      systemPrompt = `${SEO_BASE_PROMPT}

${randomStructure}`;

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

${isLargeKeyword(keyword) ? `
⚠️ 키워드 "${keyword}" 배치 필수 (큰 지역 키워드):
- 본문에 "${keyword}"를 최소 5회 이상 자연스럽게 언급해주세요
- 시작 부분, 중간 부분(2~3회), 마지막 부분에 골고루 배치
- 키워드가 너무 몰려있지 않게 분산 배치

마크다운 문법(##, **, ---, 리스트 기호 등)을 절대 사용하지 마세요. 순수 텍스트로만 작성하세요.
공백 제외 2,000자 이상 반드시 작성하세요.` : `
⚠️ 키워드 "${keyword}" 배치 필수:
1. 본문 시작 부분 (첫 2~3문장 이내)에 "${keyword}" 1회 언급
2. 본문 중간 부분에 "${keyword}" 1회 언급
3. 본문 마지막 부분 (끝 2~3문장 이내)에 "${keyword}" 1회 언급

마크다운 문법(##, **, ---, 리스트 기호 등)을 절대 사용하지 마세요. 순수 텍스트로만 작성하세요.
공백 제외 1,500자 이상 반드시 작성하세요.`}`;
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
