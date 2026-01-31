'use client';

import { BrandingType, BrandingInfo, IntroInfo, PhilosophyInfo } from '@/types';

interface StepBrandingInfoProps {
  value: BrandingInfo;
  onChange: (value: BrandingInfo) => void;
  brandingType: BrandingType | null;
}

// 각 브랜딩 타입별 질문 정의
const INTRO_QUESTIONS: { key: keyof IntroInfo; label: string; placeholder: string }[] = [
  { key: 'experience', label: '경력이 어떻게 되시나요?', placeholder: '예: 10년차, 5년 경력' },
  { key: 'specialty', label: '어떤 분야를 전문으로 하시나요?', placeholder: '예: 자연스러운 눈썹 디자인, 헤어라인 교정' },
  { key: 'startReason', label: '이 일을 시작하게 된 계기가 있나요?', placeholder: '예: 메이크업 아티스트로 일하다가 반영구에 관심을 갖게 됨' },
  { key: 'customerMind', label: '고객을 대할 때 어떤 마음으로 임하시나요?', placeholder: '예: 충분한 상담, 고객의 얼굴형에 맞는 디자인 제안' },
];

const PHILOSOPHY_QUESTIONS: { key: keyof PhilosophyInfo; label: string; placeholder: string }[] = [
  { key: 'coreValue', label: '가장 중요하게 생각하는 가치는 무엇인가요?', placeholder: '예: 자연스러움, 고객 만족, 안전한 시술' },
  { key: 'difference', label: '다른 샵과 다르게 생각하는 점이 있나요?', placeholder: '예: 트렌드보다 고객 얼굴형에 맞는 디자인, 과하지 않은 자연스러움' },
  { key: 'whyPhilosophy', label: '왜 그런 철학을 갖게 되셨나요?', placeholder: '예: 과한 시술로 후회하는 고객을 많이 봐서' },
  { key: 'message', label: '고객에게 전하고 싶은 메시지가 있나요?', placeholder: '예: 시술은 신중하게, 선택은 본인에게 맞게' },
];

const TITLE_BY_TYPE: Record<BrandingType, string> = {
  intro: '원장님에 대해 알려주세요',
  philosophy: '샵의 철학과 신념을 알려주세요',
};

const SUBTITLE_BY_TYPE: Record<BrandingType, string> = {
  intro: '간단히 답변해주시면 AI가 자연스러운 글로 만들어드립니다',
  philosophy: '어떤 가치를 중요하게 생각하시나요?',
};

export default function StepBrandingInfo({ value, onChange, brandingType }: StepBrandingInfoProps) {
  if (!brandingType) return null;

  const handleChange = (key: string, newValue: string) => {
    const updatedInfo = { ...value };
    if (brandingType === 'intro') {
      updatedInfo.intro = { ...updatedInfo.intro, [key]: newValue };
    } else if (brandingType === 'philosophy') {
      updatedInfo.philosophy = { ...updatedInfo.philosophy, [key]: newValue };
    }
    onChange(updatedInfo);
  };

  const getQuestions = () => {
    switch (brandingType) {
      case 'intro':
        return INTRO_QUESTIONS;
      case 'philosophy':
        return PHILOSOPHY_QUESTIONS;
      default:
        return [];
    }
  };

  const getCurrentValues = () => {
    switch (brandingType) {
      case 'intro':
        return value.intro;
      case 'philosophy':
        return value.philosophy;
      default:
        return {};
    }
  };

  const questions = getQuestions();
  const currentValues = getCurrentValues();

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">
          {TITLE_BY_TYPE[brandingType]}
        </h2>
        <p className="text-text-secondary">
          {SUBTITLE_BY_TYPE[brandingType]}
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-5">
        {questions.map((q, idx) => (
          <div key={q.key} className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold mr-2">
                {idx + 1}
              </span>
              {q.label}
            </label>
            <input
              type="text"
              value={(currentValues as Record<string, string>)[q.key] || ''}
              onChange={(e) => handleChange(q.key, e.target.value)}
              placeholder={q.placeholder}
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-text-primary placeholder:text-slate-400 transition-all"
            />
          </div>
        ))}

        <div className="mt-6 flex items-start gap-3 p-4 rounded-xl bg-blue-50 border border-blue-100">
          <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">작성 팁</p>
            <ul className="space-y-1 text-blue-700">
              <li>• 모든 항목을 채우지 않아도 됩니다</li>
              <li>• 키워드처럼 간단히 적어도 괜찮아요</li>
              <li>• AI가 자연스러운 문장으로 변환합니다</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
