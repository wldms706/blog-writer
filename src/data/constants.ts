import { BusinessCategory, TopicCategory, Purpose, ReaderState, SafetyCondition, Step } from '@/types';

export const STEPS: Step[] = [
  { id: 1, title: '업종 선택', subtitle: '어떤 뷰티 업종인가요?' },
  { id: 2, title: '키워드', subtitle: '검색 키워드를 입력해주세요' },
  { id: 3, title: '주제 선택', subtitle: '어떤 주제로 글을 쓸까요?' },
  { id: 4, title: '목적 선택', subtitle: '이 글의 목적은 무엇인가요?' },
  { id: 5, title: '독자 상태', subtitle: '독자는 어떤 상태인가요?' },
  { id: 6, title: '규칙 확인', subtitle: '적용되는 규칙을 확인해주세요' },
  { id: 7, title: '글 생성', subtitle: '블로그 글이 생성됩니다' },
];

// SEO 글 작성 단계
export const SEO_STEPS: Step[] = [
  { id: 1, title: '글 유형', subtitle: '어떤 글을 작성할까요?' },
  { id: 2, title: '업종', subtitle: '어떤 뷰티 업종인가요?' },
  { id: 3, title: '주제', subtitle: '어떤 주제로 글을 쓸까요?' },
  { id: 4, title: '키워드', subtitle: '검색 키워드를 입력해주세요' },
  { id: 5, title: '목적', subtitle: '이 글의 목적은 무엇인가요?' },
  { id: 6, title: '독자 상태', subtitle: '독자는 어떤 상태인가요?' },
  { id: 7, title: '규칙 확인', subtitle: '적용되는 규칙을 확인해주세요' },
  { id: 8, title: '제목 선택', subtitle: '블로그 제목을 선택해주세요' },
  { id: 9, title: '글 생성', subtitle: '블로그 글이 생성됩니다' },
];

// 브랜딩 글 작성 단계
export const BRANDING_STEPS: Step[] = [
  { id: 1, title: '글 유형', subtitle: '어떤 글을 작성할까요?' },
  { id: 2, title: '업종', subtitle: '어떤 뷰티 업종인가요?' },
  { id: 3, title: '브랜딩 종류', subtitle: '어떤 브랜딩 글인가요?' },
  { id: 4, title: '키워드', subtitle: '검색 키워드를 입력해주세요' },
  { id: 5, title: '추가 정보', subtitle: '글에 담을 내용을 입력해주세요' },
  { id: 6, title: '제목 선택', subtitle: '블로그 제목을 선택해주세요' },
  { id: 7, title: '글 생성', subtitle: '블로그 글이 생성됩니다' },
];

export const BUSINESS_CATEGORIES: BusinessCategory[] = [
  {
    id: 'semi-permanent',
    name: '반영구',
    icon: '✨',
    description: '눈썹, 아이라인, 헤어라인 등 반영구 시술',
    hasRegulation: true,
  },
  {
    id: 'scalp',
    name: '두피/탈모',
    icon: '🌱',
    description: '두피 관리, 탈모 케어 전문',
    hasRegulation: false,
  },
  {
    id: 'skin',
    name: '피부 관리',
    icon: '💎',
    description: '페이셜, 바디, 피부 관리 전반',
    hasRegulation: false,
  },
  {
    id: 'nail',
    name: '네일 아트',
    icon: '💅',
    description: '네일 케어, 젤네일, 네일아트',
    hasRegulation: false,
  },
  {
    id: 'hair',
    name: '헤어',
    icon: '💇',
    description: '커트, 펌, 염색, 헤어 스타일링',
    hasRegulation: false,
  },
  {
    id: 'makeup',
    name: '메이크업',
    icon: '💄',
    description: '웨딩, 촬영, 일상 메이크업',
    hasRegulation: false,
  },
  {
    id: 'waxing',
    name: '왁싱',
    icon: '🪶',
    description: '페이스, 바디 왁싱 전문',
    hasRegulation: false,
  },
  {
    id: 'eyelash',
    name: '속눈썹',
    icon: '👁️',
    description: '속눈썹 연장, 펌, 리프팅',
    hasRegulation: false,
  },
];

// 공통 주제 (모든 업종)
export const COMMON_TOPICS: TopicCategory[] = [
  {
    id: 'philosophy',
    name: '운영 철학',
    description: '샵을 운영하는 기준과 생각을 공유',
    icon: '📖',
  },
  {
    id: 'knowledge',
    name: '전문 지식',
    description: '고객이 알면 좋은 정보와 지식',
    icon: '📚',
  },
  {
    id: 'process',
    name: '진행 과정',
    description: '상담부터 관리까지의 과정 설명',
    icon: '🔄',
  },
  {
    id: 'criteria',
    name: '선택 기준',
    description: '좋은 샵/시술을 고르는 기준 제시',
    icon: '✅',
  },
  {
    id: 'concern',
    name: '고민 해소',
    description: '고객이 자주 갖는 걱정에 대한 답변',
    icon: '💭',
  },
  {
    id: 'daily',
    name: '일상 이야기',
    description: '샵의 일상, 소소한 에피소드',
    icon: '☕',
  },
];

// 업종별 세부 주제
export const BUSINESS_SPECIFIC_TOPICS: Record<string, TopicCategory[]> = {
  // 피부관리
  'skin': [
    { id: 'acne', name: '여드름/트러블', description: '여드름, 피부 트러블 관리 정보', icon: '🔴' },
    { id: 'pigmentation', name: '색소침착/기미', description: '기미, 잡티, 색소침착 케어', icon: '🟤' },
    { id: 'wrinkle', name: '주름/노화', description: '주름 개선, 안티에이징 관리', icon: '✨' },
    { id: 'pore', name: '모공/피지', description: '모공 축소, 피지 조절 관리', icon: '🔘' },
    { id: 'hydration', name: '보습/건조', description: '건조함 해결, 수분 공급', icon: '💧' },
    { id: 'sensitive', name: '민감성 피부', description: '예민한 피부 진정 케어', icon: '🌸' },
    { id: 'lifting', name: '탄력/리프팅', description: '처진 피부, 탄력 회복', icon: '⬆️' },
  ],
  // 반영구
  'semi-permanent': [
    { id: 'hairstroke', name: '헤어스트로크', description: '최상위 기법, 자연스럽고 오래 유지', icon: '⭐' },
    { id: 'machine-feathering', name: '머신페더링', description: '최상위 기법, 덜 아프고 자연스러운 결', icon: '⭐' },
    { id: 'embo', name: '엠보', description: '수작업 결 표현, 클래식 기법', icon: '🖌️' },
    { id: 'machine-shading', name: '머신쉐딩', description: '그라데이션 음영 표현', icon: '🎨' },
    { id: 'suji', name: '수지', description: '수지 기법, 자연스러운 눈썹', icon: '🪡' },
    { id: 'combo', name: '콤보/복합', description: '엠보+쉐딩 등 복합 기법', icon: '🔀' },
    { id: 'eyeliner', name: '아이라인', description: '아이라인 반영구 시술', icon: '👁️' },
    { id: 'hairline', name: '헤어라인', description: '헤어라인 교정 시술', icon: '💇' },
    { id: 'lips', name: '입술', description: '입술 반영구 시술 정보', icon: '💋' },
    { id: 'retouch', name: '리터치/수정', description: '리터치 주기, 수정 관리', icon: '🔄' },
  ],
  // 두피/탈모
  'scalp': [
    { id: 'hair-loss-type', name: '탈모 유형', description: '탈모 종류별 원인과 관리', icon: '📊' },
    { id: 'scalp-type', name: '두피 타입', description: '지성/건성/민감성 두피 케어', icon: '🧴' },
    { id: 'prevention', name: '탈모 예방', description: '탈모 예방 습관과 관리', icon: '🛡️' },
    { id: 'scaling', name: '두피 스케일링', description: '두피 각질, 노폐물 제거', icon: '🧹' },
    { id: 'nutrition', name: '모발 영양', description: '모발에 좋은 영양 관리', icon: '🥗' },
  ],
  // 네일
  'nail': [
    { id: 'gel', name: '젤네일', description: '젤네일 종류와 관리법', icon: '💅' },
    { id: 'care', name: '네일 케어', description: '손톱 건강, 기본 케어', icon: '🤲' },
    { id: 'art', name: '네일 아트', description: '아트 디자인, 트렌드', icon: '🎨' },
    { id: 'pedicure', name: '페디큐어', description: '발톱 관리, 페디큐어', icon: '🦶' },
    { id: 'repair', name: '손상 복구', description: '손상된 손톱 회복 케어', icon: '🔧' },
  ],
  // 헤어
  'hair': [
    { id: 'cut', name: '커트/스타일', description: '헤어 커트, 스타일링', icon: '✂️' },
    { id: 'perm', name: '펌', description: '펌 종류와 관리법', icon: '🌀' },
    { id: 'color', name: '염색', description: '염색 컬러, 유지 관리', icon: '🎨' },
    { id: 'clinic', name: '헤어 클리닉', description: '손상모 복구, 트리트먼트', icon: '💊' },
    { id: 'styling', name: '셀프 스타일링', description: '집에서 하는 스타일링 팁', icon: '🪮' },
  ],
  // 메이크업
  'makeup': [
    { id: 'wedding', name: '웨딩', description: '웨딩 메이크업 정보', icon: '💍' },
    { id: 'photo', name: '촬영/화보', description: '촬영용 메이크업', icon: '📸' },
    { id: 'daily', name: '일상 메이크업', description: '데일리 메이크업 팁', icon: '🌞' },
    { id: 'self', name: '셀프 메이크업', description: '셀프 메이크업 노하우', icon: '🪞' },
    { id: 'correction', name: '커버/보정', description: '피부 결점 커버 테크닉', icon: '✨' },
  ],
  // 왁싱
  'waxing': [
    { id: 'face', name: '페이스 왁싱', description: '얼굴 왁싱 관리', icon: '😊' },
    { id: 'body', name: '바디 왁싱', description: '팔, 다리, 겨드랑이 등', icon: '💪' },
    { id: 'brazilian', name: '브라질리언', description: '브라질리언 왁싱 정보', icon: '🌴' },
    { id: 'aftercare', name: '애프터케어', description: '왁싱 후 피부 관리', icon: '🧴' },
  ],
  // 속눈썹
  'eyelash': [
    { id: 'extension', name: '속눈썹 연장', description: '연장 종류와 관리', icon: '👁️' },
    { id: 'perm', name: '속눈썹 펌', description: '펌 시술과 유지 관리', icon: '🌀' },
    { id: 'lifting', name: '래쉬리프팅', description: '리프팅 시술 정보', icon: '⬆️' },
    { id: 'care', name: '속눈썹 케어', description: '자연 속눈썹 관리법', icon: '🌱' },
  ],
};

// 업종에 따른 주제 목록 반환 (세부 주제 + 공통 주제)
export function getTopicsForBusiness(businessId: string | null): TopicCategory[] {
  if (!businessId) return COMMON_TOPICS;

  const specificTopics = BUSINESS_SPECIFIC_TOPICS[businessId] || [];
  return [...specificTopics, ...COMMON_TOPICS];
}

// 하위 호환성을 위해 유지
export const TOPIC_CATEGORIES: TopicCategory[] = COMMON_TOPICS;

export const PURPOSES: Purpose[] = [
  {
    id: 'trust',
    name: '신뢰 형성',
    description: '전문성과 진정성으로 신뢰감을 쌓는 글',
  },
  {
    id: 'anxiety-relief',
    name: '불안 해소',
    description: '고객의 걱정과 두려움을 덜어주는 글',
  },
  {
    id: 'comparison-stop',
    name: '비교 중단',
    description: '더 이상 비교하지 않아도 되는 기준을 제시하는 글',
  },
  {
    id: 'perspective-shift',
    name: '생각의 전환',
    description: '새로운 관점을 제시하여 인식을 바꾸는 글',
  },
  {
    id: 'education',
    name: '정보 전달',
    description: '유용한 정보를 알기 쉽게 전달하는 글',
  },
];

export const READER_STATES: ReaderState[] = [
  {
    id: 'curious',
    name: '정보 탐색 중',
    description: '아직 구체적 결정 전, 정보를 모으는 단계',
    icon: '🔍',
  },
  {
    id: 'comparing',
    name: '비교 검토 중',
    description: '여러 샵을 비교하며 고민하는 단계',
    icon: '⚖️',
  },
  {
    id: 'worried',
    name: '걱정/불안',
    description: '시술에 대한 두려움이나 걱정이 있는 상태',
    icon: '😟',
  },
  {
    id: 'decided',
    name: '결정 직전',
    description: '거의 마음을 정했지만 마지막 확신이 필요한 상태',
    icon: '🎯',
  },
  {
    id: 'experienced',
    name: '경험자',
    description: '이미 시술 경험이 있고 재방문이나 수정을 고민',
    icon: '🔄',
  },
];

// Base Rules - 모든 업종 공통 적용
export type BaseRule = {
  id: string;
  title: string;
  description: string;
  icon: string;
};

export const BASE_RULES: BaseRule[] = [
  {
    id: 'purpose-first',
    title: '글의 목적 우선 설정',
    description: '모든 글은 작성 전, 명확한 목적을 먼저 정해야 합니다. 목적 없이 작성된 정보 나열형 글은 전문성으로 인식되지 않습니다.',
    icon: '🎯',
  },
  {
    id: 'reader-state',
    title: '독자 상태 가정',
    description: '글은 "모든 사람"을 대상으로 하지 않습니다. 독자는 반드시 하나의 상태로 가정합니다.',
    icon: '👤',
  },
  {
    id: 'info-structure',
    title: '정보형 글 구조 준수',
    description: '사회적 인식 제시 → 한계 설명 → 판단 기준 제시 → 선 긋기 → 변화 가능성 → 질문 마무리',
    icon: '📋',
  },
  {
    id: 'search-context',
    title: '검색 맥락 구조',
    description: '맥락(Context), 내용(Content), 연결(Chain)을 함께 고려합니다. 기준이 누적된 블로그를 전문성 있는 출처로 판단합니다.',
    icon: '🔗',
  },
  {
    id: 'skill-expression',
    title: '실력 표현 원칙',
    description: '실력을 직접 주장하지 않고, 결과/후기/만족도를 강조하지 않습니다. "판단 기준"을 설명하는 방식으로 전문성을 드러냅니다.',
    icon: '💡',
  },
  {
    id: 'content-length',
    title: '글 분량 규칙',
    description: '본문 글자 수는 최소 1,500자 이상을 기본으로 합니다. 짧은 글은 정보 밀도가 낮은 글로 인식될 수 있습니다.',
    icon: '📝',
  },
  {
    id: 'keyword-setting',
    title: '키워드 설정 원칙',
    description: '글 작성 전 반드시 키워드를 정합니다. 초기에는 "작은 지역 키워드"부터 시작하는 것을 권장합니다.',
    icon: '🔑',
  },
  {
    id: 'keyword-rotation',
    title: '키워드 운영 방식',
    description: '동일 키워드는 연속 사용하지 않습니다. 지역명 또는 속성 키워드를 교차 사용하여 분산시킵니다.',
    icon: '🔄',
  },
  {
    id: 'word-limit',
    title: '단어 반복 제한',
    description: '특정 핵심 단어는 본문 내 10회 이하로 제한합니다. 과도한 반복은 키워드 남용으로 판단될 수 있습니다.',
    icon: '⚠️',
  },
  {
    id: 'title-rule',
    title: '제목 작성 규칙',
    description: '제목에 핵심 키워드 포함, 본문 내 최소 3회 언급 (시작/중간/마무리). 질문형 또는 기준 제시형을 권장합니다.',
    icon: '📌',
  },
  {
    id: 'forbidden-words',
    title: '금지 단어 규칙',
    description: '19금, 선정적, 자극적 표현은 사용하지 않습니다. 검색 품질 및 블로그 신뢰도에 부정적 영향을 줄 수 있습니다.',
    icon: '🚫',
  },
];

// Restricted Rules - 규제 업종 추가 적용
export type RestrictedRule = {
  id: string;
  title: string;
  description: string;
  appliesTo: string[]; // 적용되는 업종 ID 배열
};

export const RESTRICTED_RULES: RestrictedRule[] = [
  {
    id: 'no-first-person',
    title: '1인칭 시술 표현 금지',
    description: '"제가 시술한", "저희 샵에서" 등 시술자 관점의 1인칭 표현을 사용하지 않습니다.',
    appliesTo: ['semi-permanent'],
  },
  {
    id: 'no-result-focus',
    title: '결과/후기 중심 서술 금지',
    description: '시술 결과나 고객 후기를 중심으로 글을 구성하지 않습니다.',
    appliesTo: ['semi-permanent'],
  },
  {
    id: 'no-booking-cta',
    title: '예약/상담 유도 문구 차단',
    description: '"지금 예약하세요", "상담 문의" 등 직접적인 CTA를 포함하지 않습니다.',
    appliesTo: ['semi-permanent'],
  },
  {
    id: 'word-repeat-strict',
    title: '특정 단어 반복 제한 강화',
    description: '규제 업종의 경우 핵심 단어 반복을 더욱 엄격하게 제한합니다.',
    appliesTo: ['semi-permanent'],
  },
  {
    id: 'image-metadata',
    title: '이미지 재사용 및 메타데이터 규칙',
    description: '이미지 재사용 시 메타데이터 관리에 주의하고, 원본 이미지 사용을 권장합니다.',
    appliesTo: ['semi-permanent'],
  },
];

// 정보형 글 구조
export const CONTENT_STRUCTURE = [
  { step: 1, title: '사회적 인식 또는 질문 제시', description: '독자가 가진 일반적인 인식이나 궁금증으로 시작' },
  { step: 2, title: '그 인식의 한계 설명', description: '왜 그 생각만으로는 부족한지 설명' },
  { step: 3, title: '판단 기준 제시', description: '어떻게 선택/판단해야 하는지 기준을 알려줌' },
  { step: 4, title: '선 긋기', description: '모두에게 필요한 것은 아니라는 점을 명확히' },
  { step: 5, title: '변화 가능성 언급', description: '상황에 따라 달라질 수 있음을 인정' },
  { step: 6, title: '질문으로 마무리', description: '독자에게 생각할 거리를 남기며 마무리' },
];

export const SAFETY_CONDITIONS: SafetyCondition[] = [
  {
    id: 'no-first-person',
    text: '시술자 1인칭 표현 사용 금지',
    description: '"제가 시술한", "저희 샵에서" 등의 표현을 사용하지 않습니다',
    required: true,
  },
  {
    id: 'no-result-claim',
    text: '시술 결과 단정 표현 금지',
    description: '"효과 보장", "확실한 결과" 등의 표현을 사용하지 않습니다',
    required: true,
  },
  {
    id: 'no-booking-cta',
    text: '예약/상담 유도 문구 금지',
    description: '"지금 예약하세요", "상담 문의" 등의 CTA를 포함하지 않습니다',
    required: true,
  },
  {
    id: 'criteria-first',
    text: '결과보다 기준을 먼저 제시',
    description: '어떻게 선택해야 하는지 기준을 먼저 알려드립니다',
    required: true,
  },
  {
    id: 'observer-perspective',
    text: '판단자 관점 유지',
    description: '시술자가 아닌 관찰자/안내자의 시선으로 작성합니다',
    required: true,
  },
];

export const POSITION_STATEMENTS = {
  default: '이 글은 정보 제공을 목적으로 하며, 특정 시술이나 샵을 권유하지 않습니다.',
  regulated: '이 글은 일반적인 정보를 공유하며, 의료적 조언이나 시술 권유가 아닙니다.',
};

export const SAMPLE_GENERATED_CONTENT = `## 천안눈썹문신, 어떤 기준으로 선택해야 할까요?

"눈썹 반영구, 어디서 하면 좋을까요?"

많은 분들이 이 질문을 합니다.
인스타그램을 뒤지고, 블로그를 읽고, 지인에게 물어봅니다.
그런데 정작 **무엇을 기준으로 선택해야 하는지**는 잘 모르는 경우가 많습니다.

---

### 흔한 선택 기준의 한계

"후기가 좋은 곳"
"사진이 예쁜 곳"
"가격이 합리적인 곳"

이런 기준으로 선택하시는 분들이 많습니다.
물론 참고할 수 있는 정보입니다.

하지만 후기는 개인의 경험이고,
사진은 조명과 각도에 따라 달라지며,
가격만으로는 퀄리티를 판단하기 어렵습니다.

---

### 진짜 확인해야 할 3가지 기준

**1. 상담 과정이 충분한가**

좋은 곳은 시술 전 충분한 시간을 들여 상담합니다.
- 얼굴형과 이목구비 분석
- 평소 화장 습관 파악
- 원하는 느낌과 라이프스타일 고려

"빨리 예약하세요"보다 "어떤 스타일을 원하세요?"라고 먼저 묻는 곳을 찾아보세요.

**2. 다양한 케이스를 보여줄 수 있는가**

포트폴리오에서 다양한 얼굴형, 다양한 스타일을 확인해보세요.
모든 결과물이 비슷하다면, 나에게 맞는 맞춤 디자인을 기대하기 어려울 수 있습니다.

**3. 이후 관리에 대해 설명해주는가**

천안눈썹문신은 한 번으로 끝나지 않습니다.
- 리터치 주기
- 자연스러운 변화 과정
- 수정이 필요할 때의 대응 방식

이런 부분까지 미리 안내해주는 곳이 신뢰할 수 있습니다.

---

### 모든 분께 반영구가 필요한 것은 아닙니다

눈썹 화장이 불편하지 않다면,
반영구를 꼭 해야 할 이유는 없습니다.

다만, 아침 시간을 줄이고 싶거나
눈썹 그리기가 어려운 분들에게는
좋은 선택지가 될 수 있습니다.

---

### 시간이 지나면 자연스럽게 옅어집니다

반영구는 영구적이지 않습니다.
1~2년에 걸쳐 서서히 옅어지기 때문에,
처음 선택이 평생을 결정하는 것은 아닙니다.

그래서 첫 시술보다 **꾸준한 관리**가 더 중요할 수 있습니다.

---

눈썹은 얼굴의 인상을 좌우합니다.
그래서 선택이 중요합니다.

충분히 알아보고 계신가요?
어떤 기준으로 선택하실 건가요?`;
