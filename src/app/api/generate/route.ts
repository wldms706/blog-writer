import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkAndIncrementUsage } from '@/lib/usage';
import {
  SEO_REGULATED_PROMPT,
  SEO_REVIEW_STYLE_PROMPT,
  BRANDING_GENERAL_PROMPT,
  BRANDING_REGULATED_PROMPT,
  REGULATED_KEYWORDS,
  BRANDING_TYPE_NAMES,
  TONE_PROMPT_OVERRIDES,
  isLargeKeyword,
  getRandomDiversityKit,
  filterMedicalTerms,
  filterForeignWords,
  filterListBullets,
  filterFirstPerson,
  filterBannedWords,
} from '@/lib/prompts';
// analyzeTopBlogs 제거 — 타샵 상호/내용이 복사되는 문제 발생

// Vercel 함수 타임아웃 60초로 설정
export const maxDuration = 60;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

// 사용자 입력 sanitize (프롬프트 인젝션 방지)
function sanitize(input: unknown): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/[{}[\]`]/g, '')
    .replace(/\n/g, ' ')
    .slice(0, 200)
    .trim();
}

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
      treatmentInfo,
      customPurpose,
      tonePreset = 'warm',
      shopAddress,
      shopHours,
      shopPhone,
      shopParking,
    } = await request.json();

    const safeKeyword = sanitize(keyword);
    const safeTopic = sanitize(topic);
    const safePurpose = sanitize(purpose);
    const safeReaderState = sanitize(readerState);
    const safeSelectedTitle = sanitize(selectedTitle);
    const safeCustomPurpose = sanitize(customPurpose);
    const safeBusinessCategory = sanitize(businessCategory);
    const safeTreatmentInfo = sanitize(treatmentInfo);

    // 규제 업종 여부 확인
    const isRegulatedBusiness = safeBusinessCategory === 'semi-permanent' || safeBusinessCategory === '반영구' || REGULATED_KEYWORDS.some(k => safeKeyword.includes(k));

    // 타샵 내용 복사 방지 규칙
    const antiCopyRule = `
⚠️⚠️ 타샵 내용 복사 절대 금지:
- 다른 블로그/샵의 상호명, 원장명, 브랜드명을 절대 언급하지 마세요
- 인터넷에서 본 다른 글의 문장을 그대로 가져오지 마세요
- 완전히 새롭고 독창적인 문장으로만 작성하세요`;

    // 샵 정보 텍스트 — 반영구(규제 업종)에서는 비공개 위험으로 완전 제외
    const shopInfoParts: string[] = [];
    if (!isRegulatedBusiness) {
      if (shopAddress?.trim()) shopInfoParts.push(`주소: ${sanitize(shopAddress)}`);
      if (shopHours?.trim()) shopInfoParts.push(`영업시간: ${sanitize(shopHours)}`);
      if (shopPhone?.trim()) shopInfoParts.push(`연락처: ${sanitize(shopPhone)}`);
      if (shopParking?.trim()) shopInfoParts.push(`주차: ${sanitize(shopParking)}`);
    }
    const shopInfoText = shopInfoParts.length > 0 ? shopInfoParts.join(' / ') : '';

    // 매장 정보에 맞는 동적 사진 가이드 생성
    const shopPhotoGuides: string[] = [];
    if (!isRegulatedBusiness) {
      if (shopAddress?.trim()) {
        shopPhotoGuides.push('- 매장 위치/주소 안내 문장 바로 위에 [편집가이드: 매장 외관/간판 사진을 넣어주세요] 삽입');
      }
      if (shopParking?.trim()) {
        shopPhotoGuides.push('- 주차 안내 문장 바로 위에 [편집가이드: 주차 공간 사진이 있으면 넣어주세요] 삽입');
      }
      if (shopHours?.trim()) {
        shopPhotoGuides.push('- 영업시간 안내 근처에 [편집가이드: 매장 내부 인테리어 사진을 넣어주세요] 삽입');
      }
    }
    const shopPhotoGuideText = shopPhotoGuides.length > 0
      ? `\n⚠️ 매장 정보 관련 사진 가이드 (반드시 해당 내용 근처에 배치):\n${shopPhotoGuides.join('\n')}\n`
      : '';

    let systemPrompt: string;
    let userPrompt: string;

    // 비규제 업종에만 톤 오버라이드 적용
    const toneOverride = (!isRegulatedBusiness && tonePreset && TONE_PROMPT_OVERRIDES[tonePreset]) ? `\n\n${TONE_PROMPT_OVERRIDES[tonePreset]}` : '';

    if (contentType === 'branding') {
      // 브랜딩 글 생성
      systemPrompt = (isRegulatedBusiness ? BRANDING_REGULATED_PROMPT : BRANDING_GENERAL_PROMPT) + toneOverride;
      const brandingTypeName = BRANDING_TYPE_NAMES[brandingType] || '브랜딩';

      // 구조화된 브랜딩 정보를 상세 텍스트로 변환
      let detailedInfo = '';
      if (brandingInfo && brandingType) {
        const info = brandingInfo[brandingType];
        if (brandingType === 'recruit' && info) {
          const { courseName, targetStudent, curriculum, benefit } = info;
          detailedInfo = `
## 교육 과정 정보 (이 정보를 바탕으로 수강생 모집 글을 작성하세요)
- 교육 과정명: ${courseName || '미입력'}
- 대상: ${targetStudent || '미입력'}
- 커리큘럼/수업 내용: ${curriculum || '미입력'}
- 수강 혜택/강점: ${benefit || '미입력'}`;
        } else if (brandingType === 'philosophy' && info) {
          const { coreValue, difference, whyPhilosophy, message } = info;
          detailedInfo = `
## 샵의 철학/신념 (이 정보를 바탕으로 글을 작성하세요)
- 가장 중요한 가치: ${coreValue || '미입력'}
- 다른 샵과 다른 점: ${difference || '미입력'}
- 그런 철학을 갖게 된 이유: ${whyPhilosophy || '미입력'}
- 고객에게 전하고 싶은 메시지: ${message || '미입력'}`;
        }
      }

      userPrompt = `다음 조건에 맞는 뷰티 브랜딩 블로그 글을 작성해주세요.

키워드: ${safeKeyword}
업종: ${safeBusinessCategory}
브랜딩 종류: ${brandingTypeName}
${safeSelectedTitle ? `제목: ${safeSelectedTitle}` : ''}
${detailedInfo}

## 브랜딩 종류별 글 구조

${brandingType === 'recruit' ? (isRegulatedBusiness ? `
### 수강생 모집 글 구조 (규제 업종):
⚠️ 직접적인 홍보가 아닌, 교육 과정 정보 전달 형태로 작성하세요.
1. 반영구/두피문신 분야에 관심 있는 사람들의 고민으로 시작
2. 이 분야를 배우면 어떤 점이 좋은지 (전직, 부업, 스킬업 등 일반론)
3. 교육 과정 선택 시 확인해야 할 사항 (커리큘럼, 실습, 수료 후 지원 등)
4. 위 교육 과정 정보를 자연스럽게 녹여서 안내
5. 마무리: 충분히 비교해보고 결정하라는 조언
- 1인칭 금지. 주어 생략 또는 수동태 사용
- 특정 업체명/브랜드명 절대 금지
` : `
### 수강생 모집 글 구조:
1. 이 분야에 관심 있는 사람들의 고민이나 궁금증으로 시작
2. 교육 과정 소개 — 위 정보의 "교육 과정명", "커리큘럼" 활용
3. 어떤 분들에게 적합한지 — 위 정보의 "대상" 활용
4. 수강 혜택과 강점 — 위 정보의 "수강 혜택/강점" 활용
5. 마무리: 문의/상담 안내
- 1인칭("저는", "제가") 자연스럽게 사용 가능
- 입력된 교육 과정 정보를 자연스럽게 문장으로 풀어서 작성
`) : ''}

${brandingType === 'philosophy' ? (isRegulatedBusiness ? `
### 정보성 글 구조 (규제 업종):
⚠️ 샵 철학이 아닌, 업계 정보 전달 글로 작성하세요.
1. 눈썹문신/반영구 업계의 일반적인 현상이나 트렌드
2. 시술 선택 시 중요하게 봐야 할 가치들 (일반론)
3. 좋은 시술의 조건, 피해야 할 것들
4. 시술 후 관리의 중요성
5. 마무리: 신중한 선택을 위한 조언
- 절대 금지: 특정 샵/시술자 언급, 자기 홍보, 고객 만족 언급
` : `
### 철학/신념 글 구조:
1. 업계의 일반적인 현상이나 트렌드 언급
2. 이 샵이 다르게 생각하는 점 (위 정보의 "다른 샵과 다른 점" 활용)
3. 왜 그런 철학을 갖게 되었는지 (위 정보의 "그런 철학을 갖게 된 이유" 활용)
4. 가장 중요하게 생각하는 가치 (위 정보의 "가장 중요한 가치" 활용)
5. 마무리 메시지 (위 정보의 "고객에게 전하고 싶은 메시지" 활용)
- 1인칭("저는", "제가") 사용하여 자신의 철학을 진솔하게 전달
- 입력된 정보를 자연스럽게 문장으로 풀어서 작성
`) : ''}

${shopInfoText ? (isRegulatedBusiness ? `
⚠️ 안내 정보 (글 마지막에):
본문 마무리 후, 아래 정보를 주어 없이 수동태로 짧게 안내하세요.
예: "평일 야간 및 주말에도 예약제로 운영되고 있다. 전용 주차 공간이 완비되어 있다."
${shopInfoText}
${shopPhotoGuideText}` : `
⚠️ 샵 정보 (글 마지막에 짧게):
글 마무리 후, 아래 정보를 1~2문장으로 짧게 넣어주세요.
예: "저희는 ○○동에 있고요, 평일 10시~20시까지 운영하고 있어요. 주차도 가능합니다."
${shopInfoText}
${shopPhotoGuideText}`) : ''}

⚠️ 중요 규칙:
${isRegulatedBusiness ? `
## 규제 업종 필수 준수사항 (반영구/눈썹문신)
- 자기 홍보 절대 금지: "이 샵이 시술 잘한다", "고객이 만족한다", "추천으로 방문한다" 등 금지
- 1인칭 금지: "저는", "제가", "저희" 사용 금지
- 특정 샵 언급 금지: "이 샵에서는", "이 샵의 원장은" 금지
- 결과/후기 언급 금지: "감탄사를 연발", "자연스럽다는 칭찬" 금지
- 대신: 업종에 대한 일반적인 정보, 좋은 샵 고르는 기준, 시술 전 알아야 할 것 등 정보 전달 중심으로 작성` : `- 1인칭("저는", "제가") 자연스럽게 사용 가능`}
- "예약하세요", "상담받으세요" 등 영업 표현 금지
- 진정성 있고 따뜻한 톤으로 작성
- 위에 제공된 정보를 최대한 활용하여 구체적이고 개성 있는 글 작성

${safeSelectedTitle ? `제목은 "${safeSelectedTitle}"을 그대로 사용하세요.
⚠️⚠️⚠️ 제목-본문 일치 (최우선 규칙):
- 제목 "${safeSelectedTitle}"이 던지는 질문/주장/약속을 본문에서 반드시 답하세요
- 제목에서 언급한 핵심 포인트가 본문의 중심 주제가 되어야 합니다
- 제목과 무관한 내용으로 본문을 채우면 글 전체 거부됩니다
- 도입부 첫 2~3문장에서 제목의 맥락을 바로 이어가세요` : '제목을 첫 줄에 쓰고,'} 한 줄 띄운 후 본문을 작성해주세요.

⚠️⚠️⚠️ 키워드 "${safeKeyword}" 배치 (네이버 노출 핵심 — 이 규칙을 어기면 글 전체 거부):
- 제목에 반드시 "${safeKeyword}" 1회 포함 (필수)
- 본문 첫 2~3문장 이내에 "${safeKeyword}" 1회 (필수 — 없으면 거부)
- 본문 중간에 "${safeKeyword}" 2회 분산 배치 (필수)
- 본문 마지막 2~3문장 이내에 "${safeKeyword}" 1회 (필수 — 없으면 거부)
- 합계: 본문에 "${safeKeyword}"가 최소 4회, 최대 6회 등장해야 함
- "${safeKeyword}"를 정확히 그대로 써야 함 (띄어쓰기, 순서 변경 금지)

⚠️ 마크다운 절대 금지. 순수 텍스트로만 작성하세요.

⚠️⚠️⚠️ 글자수: 공백 제외 최소 1,500자 이상 반드시 작성`;

    } else {
      // SEO 글 생성
      systemPrompt = isRegulatedBusiness ? SEO_REGULATED_PROMPT : `${SEO_REVIEW_STYLE_PROMPT}${toneOverride}`;

      // 매번 다른 글이 나오도록 구조+도입부+톤+시작시드 랜덤 조합
      const diversity = getRandomDiversityKit();

      userPrompt = `다음 조건에 맞는 ${isRegulatedBusiness ? '전문 정보 블로그 글' : '시술자 관점의 블로그 글'}을 작성해주세요.

키워드: ${safeKeyword}
업종: ${safeBusinessCategory}
글 주제: ${safeTopic}
글의 목적: ${safePurpose}
독자 상태: ${safeReaderState}
${safeSelectedTitle ? `제목: ${safeSelectedTitle}

⚠️⚠️⚠️ 제목 기반 글 방향 (가장 중요):
제목 "${safeSelectedTitle}"이 핵심입니다. 이 제목이 말하는 주제/관점/약속이 글 전체를 관통해야 합니다.
- 제목이 질문이면: 그 질문에 구체적으로 답하는 글
- 제목이 주장이면: 그 주장을 뒷받침하는 근거와 사례로 글 구성
- 제목이 경고면: 왜 위험한지 구체적 이유와 사례로 설득
- 제목이 비교면: 실제 차이를 구체적으로 분석
다른 제목이었다면 완전히 다른 내용이 나와야 합니다. 제목과 무관한 일반론 나열은 거부됩니다.` : ''}

${!isRegulatedBusiness ? `
## 이번 글의 구조 (이 구조를 따라 작성하세요)
${diversity.structure}
` : ''}

## 이번 글의 관점/앵글 (가장 중요! 이 관점으로 글 전체를 관통하세요)
${diversity.angle}

## 도입부 스타일 (반드시 이 방식으로 글을 시작하세요)
${diversity.introStyle}

## 글의 톤/화법 (글 전체에 이 톤을 유지하세요)
${diversity.tone}

## 첫 문장 방향 (이 맥락에서 시작하되, 그대로 복사하지 말고 키워드에 맞게 변형하세요)
"${diversity.openingSeed}"

${safeCustomPurpose ? `
⚠️⚠️ 최우선 반영 필수: 아래 내용을 글 전체에서 핵심 메시지로 담아주세요.
단순 언급이 아니라, 이 내용이 글의 중심 주제가 되어야 합니다.

⚠️ 반드시 전달할 내용: ${safeCustomPurpose}
` : ''}
${safeTreatmentInfo ? (isRegulatedBusiness ? `
⚠️⚠️ 필수 반영: 이 샵의 특별한 시술/프로그램 정보
아래 내용을 본문의 숫자 소제목 중 하나로 자연스럽게 녹여서 포함하세요.
1인칭 없이 객관적으로 서술하세요:
- "~프로그램이 병행될 때 유지력은 극대화된다"
- "~기법이 적용되어야 자연스러운 결과를 기대할 수 있다"

⚠️ 반드시 포함할 내용: ${safeTreatmentInfo}
` : `
⚠️⚠️ 필수 반영: 이 샵의 특별한 시술/프로그램 정보
아래 내용을 시술자가 자기 노하우를 공유하듯 자연스럽게 녹여서 포함하세요.
시술자 본인의 경험으로 서술하세요:
- "제가 이 기법을 쓰는 이유가 있거든요"
- "저희 쪽에서는 OO 방식으로 하는데, 확실히 결과가 다르더라고요"

⚠️ 반드시 포함할 내용: ${safeTreatmentInfo}
`) : ''}

${isRegulatedBusiness ? `
⚠️ 이 글은 규제 업종(반영구/두피문신)입니다:
- 1인칭(저는, 제가, 저희, 우리) 절대 금지. 주어 생략하거나 수동태 사용
- "눈썹", "문신", "반영구", "두피" 각 단어 10회 이하
- 이 시술/기법만의 구체적인 기술 원리를 깊이 있게 다뤄주세요
- 본문은 "1. 소제목" 형태의 숫자 소제목 3~4개로 구성
${shopInfoText ? `
⚠️ 안내 정보 (글 마지막에):
본문 마무리 후, 아래 정보를 주어 없이 수동태로 짧게 안내하세요.
${shopInfoText}
${shopPhotoGuideText}` : ''}
` : `
⚠️ 업종 키워드 반복 제한:
- 업종 단어는 각각 10회 이하
${shopInfoText ? `
⚠️ 샵 정보 (글 마지막에 짧게):
글 마무리 후, 아래 정보를 1~2문장으로 짧게 넣어주세요.
${shopInfoText}
${shopPhotoGuideText}` : ''}
`}

위 조건을 반영하여, ${isRegulatedBusiness ? '독자에게 깊이 있는 전문 정보를 전달하는 글' : '시술자가 본인 블로그에 쓰는 자연스러운 정보 공유 글'}을 작성해주세요.
${safeSelectedTitle ? `제목은 "${safeSelectedTitle}"을 그대로 사용하세요.
⚠️⚠️⚠️ 제목-본문 일치 (최우선 규칙):
- 제목 "${safeSelectedTitle}"이 던지는 질문/주장/약속을 본문에서 반드시 답하세요
- 제목에서 언급한 핵심 포인트가 본문의 중심 주제가 되어야 합니다
- 도입부 첫 2~3문장에서 제목의 맥락을 바로 이어가세요` : '제목을 첫 줄에 쓰고,'} 한 줄 띄운 후 본문을 작성해주세요.

${isLargeKeyword(safeKeyword) ? `
⚠️ 키워드 "${safeKeyword}" 배치 필수 (큰 지역 키워드):
- 제목에 반드시 1회 포함
- 본문에 "${safeKeyword}"를 정확히 5~7회만 언급 (8회 이상 절대 금지)
- 첫 문단에 1회, 중간에 2~3회, 마지막 문단에 1회 - 골고루 분산 배치
` : `
⚠️⚠️⚠️ 키워드 "${safeKeyword}" 배치 (네이버 노출 핵심):
- 제목에 반드시 "${safeKeyword}" 1회 포함 (필수)
- 본문에 "${safeKeyword}"가 최소 4회, 최대 6회 등장해야 함
- 첫 2~3문장 내 1회, 중간 2회 분산, 마지막 2~3문장 내 1회
- "${safeKeyword}"를 정확히 그대로 써야 함
`}
마크다운 절대 금지. 순수 텍스트로만 작성하세요.

⚠️⚠️⚠️ 글자수: 공백 제외 1,400~1,600자로 작성`;
    }

    const fullPrompt = systemPrompt + antiCopyRule + `\n\n⚠️⚠️⚠️ 최우선 규칙 — [편집가이드] 리터럴 출력 필수 ⚠️⚠️⚠️
[편집가이드: ...]는 당신이 해석하거나 실행할 지시가 아닙니다.
이것은 최종 출력물에 반드시 그대로 포함되어야 하는 "리터럴 텍스트"입니다.
블로그 글 본문 중간중간에 [편집가이드: 여기에 시술 전후 사진을 넣어주세요] 같은 형태로 최소 4개 이상 삽입하세요.
절대로 편집가이드를 생략하거나, 다른 형태로 바꾸거나, 해석하지 마세요.
반드시 [편집가이드: ...] 대괄호 형식 그대로 출력하세요.\n\n` + userPrompt;

    const response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
        generationConfig: {
          temperature: 1.3,
          maxOutputTokens: 8192,
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

    // Gemini 안전 필터 차단 확인
    if (data.candidates?.[0]?.finishReason === 'SAFETY') {
      console.error('Gemini SAFETY block:', JSON.stringify(data.candidates[0].safetyRatings));
      return NextResponse.json({ error: 'AI 안전 필터에 의해 차단되었습니다. 다시 시도해주세요.' }, { status: 400 });
    }

    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!generatedText) {
      console.error('Gemini empty response:', JSON.stringify(data));
      return NextResponse.json({ error: '생성된 텍스트가 없습니다.' }, { status: 500 });
    }

    // 후처리 필터 파이프라인
    let filteredText = filterMedicalTerms(generatedText);
    filteredText = filterForeignWords(filteredText);
    filteredText = filterListBullets(filteredText, isRegulatedBusiness);
    filteredText = filterBannedWords(filteredText);
    if (isRegulatedBusiness) {
      filteredText = filterFirstPerson(filteredText);
    }

    return NextResponse.json({ content: filteredText });
  } catch (error) {
    console.error('Generate error:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
