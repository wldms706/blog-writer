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
  location: string;        // 샵 위치/동네
  startTime: string;       // 시작 시기
  spaceFeature: string;    // 공간 특징 (1인샵, 인테리어 등)
  atmosphere: string;      // 분위기
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
