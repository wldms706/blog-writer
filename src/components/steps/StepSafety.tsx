'use client';

import { useState, useEffect } from 'react';
import { SAFETY_CONDITIONS } from '@/data/constants';

interface StepSafetyProps {
  confirmed: boolean;
  onConfirm: (confirmed: boolean) => void;
}

export default function StepSafety({ confirmed, onConfirm }: StepSafetyProps) {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const allChecked = SAFETY_CONDITIONS.every((c) => checkedItems.has(c.id));

  useEffect(() => {
    onConfirm(allChecked);
  }, [allChecked, onConfirm]);

  const toggleItem = (id: string) => {
    setCheckedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">
          안전 조건을 확인해주세요
        </h2>
        <p className="text-text-secondary">
          모든 조건을 확인해야 글 생성이 가능합니다
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-4">
        {SAFETY_CONDITIONS.map((condition) => {
          const isChecked = checkedItems.has(condition.id);

          return (
            <button
              key={condition.id}
              onClick={() => toggleItem(condition.id)}
              className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-300
                ${
                  isChecked
                    ? 'border-success bg-success/5'
                    : 'border-border-light bg-background-card hover:border-secondary-dark'
                }
              `}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-300
                    ${
                      isChecked
                        ? 'border-success bg-success'
                        : 'border-border bg-transparent'
                    }
                  `}
                >
                  {isChecked && (
                    <svg
                      className="w-4 h-4 text-white"
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

                <div className="flex-1">
                  <h3
                    className={`font-semibold mb-1 transition-colors ${
                      isChecked ? 'text-success' : 'text-text-primary'
                    }`}
                  >
                    {condition.text}
                  </h3>
                  <p className="text-sm text-text-secondary">
                    {condition.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Progress Indicator */}
      <div className="mt-8 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-text-secondary">확인 진행률</span>
          <span className="text-sm font-medium text-primary">
            {checkedItems.size} / {SAFETY_CONDITIONS.length}
          </span>
        </div>
        <div className="h-2 bg-background-subtle rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              allChecked
                ? 'bg-success'
                : 'bg-gradient-to-r from-primary to-accent'
            }`}
            style={{
              width: `${(checkedItems.size / SAFETY_CONDITIONS.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {allChecked && (
        <div className="mt-6 text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-success/10 text-success text-sm font-medium">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            모든 조건이 확인되었습니다
          </div>
        </div>
      )}
    </div>
  );
}
