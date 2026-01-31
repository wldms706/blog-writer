export type BusinessCategory = {
  id: string;
  name: string;
  icon: string;
  description: string;
  hasRegulation: boolean;
};

export type TopicCategory = {
  id: string;
  name: string;
  description: string;
  icon: string;
};

export type Purpose = {
  id: string;
  name: string;
  description: string;
};

export type ReaderState = {
  id: string;
  name: string;
  description: string;
  icon: string;
};

export type SafetyCondition = {
  id: string;
  text: string;
  description: string;
  required: boolean;
};

export type ContentType = 'seo' | 'branding';
export type BrandingType = 'intro' | 'philosophy' | 'story';

// 브랜딩 종류별 구조화된 정보
export type IntroInfo = {
  experience: string;      // 경력 (예: 10년차)
  specialty: string;       // 전문 분야
  startReason: string;     // 이 일을 시작한 계기
  customerMind: string;    // 고객을 대하는 마음
};

export type PhilosophyInfo = {
  coreValue: string;       // 가장 중요한 가치
  difference: string;      // 다른 샵과 다른 점
  whyPhilosophy: string;   // 왜 그런 철학을 갖게 됐는지
  message: string;         // 고객에게 전하고 싶은 메시지
};

export type StoryInfo = {
  character: string;       // 가상 인물 (예: 30대 직장인, 결혼 앞둔 신부)
  situation: string;       // 상황/고민 (예: 매일 눈썹 그리기 힘들어서)
  season: string;          // 계절/시기 (예: 여름, 결혼 준비 중)
  insight: string;         // 깨달음/정보 (예: 요즘 눈썹문신은 자연스럽다는 걸 알게 됨)
};

export type BrandingInfo = {
  intro: IntroInfo;
  philosophy: PhilosophyInfo;
  story: StoryInfo;
};

export type FormData = {
  contentType: ContentType;
  businessCategory: string | null;
  keyword: string;
  topic: string | null;
  purpose: string | null;
  readerState: string | null;
  rulesConfirmed: boolean;
  selectedTitle: string;
  additionalContext: string;
  // 브랜딩 글 전용
  brandingType: BrandingType | null;
  brandingInfo: BrandingInfo;
};

export type Step = {
  id: number;
  title: string;
  subtitle: string;
};
