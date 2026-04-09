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
export type SeoStyle = 'review' | 'expert';
export type BrandingType = 'recruit' | 'philosophy';
export type TonePreset = 'warm' | 'professional' | 'conversational';

// 브랜딩 종류별 구조화된 정보
export type RecruitInfo = {
  courseName: string;       // 교육 과정명 (예: 반영구 눈썹 1:1 클래스)
  targetStudent: string;    // 대상 (예: 입문자, 전직 희망자, 기존 시술자 스킬업)
  curriculum: string;       // 커리큘럼/수업 내용 (예: 이론+실습 8회, 모델 실습 포함)
  benefit: string;          // 수강 혜택/강점 (예: 소수정예, 수료 후 취업연계, 재료 제공)
};

export type PhilosophyInfo = {
  coreValue: string;       // 가장 중요한 가치
  difference: string;      // 다른 샵과 다른 점
  whyPhilosophy: string;   // 왜 그런 철학을 갖게 됐는지
  message: string;         // 고객에게 전하고 싶은 메시지
};

export type BrandingInfo = {
  recruit: RecruitInfo;
  philosophy: PhilosophyInfo;
};

export type FormData = {
  contentType: ContentType;
  seoStyle: SeoStyle;
  businessCategory: string | null;
  keyword: string;
  topic: string | null;
  purpose: string | null;
  customPurpose: string;    // 목적 자유 입력 텍스트
  readerState: string | null;
  rulesConfirmed: boolean;
  selectedTitle: string;
  additionalContext: string;
  // 브랜딩 글 전용
  brandingType: BrandingType | null;
  brandingInfo: BrandingInfo;
  // 톤 프리셋 (반영구 제외)
  tonePreset: TonePreset;
  // 샵 정보 (반영구 제외 - 글에 자연스럽게 포함)
  shopAddress: string;
  shopHours: string;
  shopPhone: string;
  shopParking: string;
};

export type Step = {
  id: number;
  title: string;
  subtitle: string;
};
