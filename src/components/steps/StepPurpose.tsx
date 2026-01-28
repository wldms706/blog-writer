'use client';

import { PURPOSES } from '@/data/constants';

interface StepPurposeProps {
  selected: string | null;
  onSelect: (id: string) => void;
}

export default function StepPurpose({ selected, onSelect }: StepPurposeProps) {
  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">
          이 글의 목적은 무엇인가요?
        </h2>
        <p className="text-text-secondary">
          목적에 맞는 톤과 구성으로 글을 작성합니다
        </p>
      </div>

      <div className="max-w-xl mx-auto space-y-3">
        {PURPOSES.map((purpose) => (
          <button
            key={purpose.id}
            onClick={() => onSelect(purpose.id)}
            className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-300 group
              ${
                selected === purpose.id
                  ? 'border-primary bg-gradient-to-r from-primary/5 to-accent/5 shadow-lg'
                  : 'border-border-light bg-background-card hover:border-secondary-dark hover:shadow-md'
              }
            `}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3
                  className={`text-lg font-semibold mb-1 transition-colors ${
                    selected === purpose.id ? 'text-primary' : 'text-text-primary'
                  }`}
                >
                  {purpose.name}
                </h3>
                <p className="text-sm text-text-secondary">
                  {purpose.description}
                </p>
              </div>

              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ml-4 transition-all duration-300
                  ${
                    selected === purpose.id
                      ? 'border-primary bg-primary'
                      : 'border-border bg-transparent group-hover:border-secondary-dark'
                  }
                `}
              >
                {selected === purpose.id && (
                  <svg
                    className="w-3.5 h-3.5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
