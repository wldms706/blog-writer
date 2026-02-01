'use client';

import { useState } from 'react';

interface StepTreatmentInfoProps {
  value: string;
  onChange: (value: string) => void;
}

const EXAMPLE_DESCRIPTIONS = [
  {
    name: '탕탕이',
    description: '살빠지는 앰플을 몸에 주입해서 지방을 분해하는 프로그램. 주 1-2회 관리 권장.',
  },
  {
    name: '윤곽주사',
    description: '얼굴 윤곽선을 정리하는 리프팅 관리. 턱라인, 볼살 등 부위별 집중 케어.',
  },
  {
    name: '고주파 관리',
    description: '고주파 열에너지로 피부 속 콜라겐 생성을 촉진하는 탄력 관리.',
  },
];

export default function StepTreatmentInfo({ value, onChange }: StepTreatmentInfoProps) {
  const [showExamples, setShowExamples] = useState(false);

  const handleExampleClick = (example: typeof EXAMPLE_DESCRIPTIONS[0]) => {
    onChange(`[${example.name}] ${example.description}`);
    setShowExamples(false);
  };

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">
          우리 샵만의 특별한 시술이 있나요?
        </h2>
        <p className="text-text-secondary">
          샵만의 고유 프로그램이 있다면 간단히 설명해주세요
        </p>
        <p className="text-sm text-text-muted mt-1">
          (선택사항 - 건너뛰어도 됩니다)
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-4">
        {/* 입력 필드 */}
        <div className="card p-6">
          <label className="block text-sm font-medium text-text-primary mb-2">
            시술/프로그램 설명
          </label>
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="예: [탕탕이] 살빠지는 앰플을 몸에 주입해서 지방을 분해해주는 프로그램이에요. 주 1-2회 관리하면 효과가 좋아요."
            className="w-full h-32 px-4 py-3 rounded-xl border border-border-light bg-background-subtle
              focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none
              transition-all placeholder:text-text-muted text-text-primary resize-none"
          />
          <p className="text-xs text-text-muted mt-2">
            이 내용이 블로그 글에 자연스럽게 녹아들어 작성됩니다.
          </p>
        </div>

        {/* 예시 토글 버튼 */}
        <button
          onClick={() => setShowExamples(!showExamples)}
          className="w-full flex items-center justify-center gap-2 text-sm text-primary hover:text-primary-dark transition-colors py-2"
        >
          <svg
            className={`w-4 h-4 transition-transform ${showExamples ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          {showExamples ? '예시 숨기기' : '작성 예시 보기'}
        </button>

        {/* 예시 목록 */}
        {showExamples && (
          <div className="card p-4 space-y-3 animate-fade-in">
            <p className="text-xs text-text-muted mb-2">클릭하면 예시가 입력됩니다</p>
            {EXAMPLE_DESCRIPTIONS.map((example, index) => (
              <button
                key={index}
                onClick={() => handleExampleClick(example)}
                className="w-full text-left p-3 rounded-lg bg-background-subtle hover:bg-secondary-light border border-transparent hover:border-primary/20 transition-all"
              >
                <span className="font-medium text-primary">[{example.name}]</span>
                <span className="text-text-secondary ml-2 text-sm">{example.description}</span>
              </button>
            ))}
          </div>
        )}

        {/* 안내 메시지 */}
        <div className="card p-4 bg-blue-50 border-blue-100">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-blue-800 font-medium">이런 내용을 적어주세요</p>
              <ul className="text-sm text-blue-700 mt-1 space-y-0.5">
                <li>• 프로그램/시술 이름</li>
                <li>• 어떤 효과가 있는지</li>
                <li>• 어떻게 진행되는지 간단히</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
