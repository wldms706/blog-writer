'use client';

import { useState, useEffect } from 'react';
import { RESTRICTED_RULES, CONTENT_STRUCTURE, BUSINESS_CATEGORIES } from '@/data/constants';

interface StepRulesProps {
  businessCategory: string | null;
  confirmed: boolean;
  onConfirm: (confirmed: boolean) => void;
}

export default function StepRules({ businessCategory, onConfirm }: StepRulesProps) {
  const [restrictedRulesExpanded, setRestrictedRulesExpanded] = useState(true);
  const [structureExpanded, setStructureExpanded] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);

  const business = BUSINESS_CATEGORIES.find((b) => b.id === businessCategory);
  const hasRegulation = business?.hasRegulation;

  // 해당 업종에 적용되는 Restricted Rules 필터링
  const applicableRestrictedRules = RESTRICTED_RULES.filter(
    (rule) => businessCategory && rule.appliesTo.includes(businessCategory)
  );

  useEffect(() => {
    onConfirm(acknowledged);
  }, [acknowledged, onConfirm]);

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-black text-black mb-2">
          적용되는 규칙을 확인해주세요
        </h2>
        <p className="text-gray-500">
          이 규칙들이 글 생성에 자동으로 적용됩니다
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-4">
        {/* Base Rules - Hidden (내부 기준으로 자동 적용) */}

        {/* Restricted Rules (규제 업종인 경우에만) */}
        {hasRegulation && applicableRestrictedRules.length > 0 && (
          <div className="card overflow-hidden border-orange-500/30">
            <button
              onClick={() => setRestrictedRulesExpanded(!restrictedRulesExpanded)}
              className="w-full p-5 flex items-center justify-between bg-orange-500 text-white rounded-2xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <span className="text-xl">⚠️</span>
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-white">Restricted Rules</h3>
                  <p className="text-sm text-white/80">
                    {business?.name} 업종 추가 적용 ({applicableRestrictedRules.length}개)
                  </p>
                </div>
              </div>
              <svg
                className={`w-5 h-5 text-white/70 transition-transform ${restrictedRulesExpanded ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {restrictedRulesExpanded && (
              <div className="p-5 pt-0 animate-fade-in">
                <div className="space-y-3 mt-4">
                  {applicableRestrictedRules.map((rule) => (
                    <div
                      key={rule.id}
                      className="p-4 rounded-xl bg-orange-50 border-l-4 border-orange-500"
                    >
                      <h4 className="font-medium text-black mb-1">{rule.title}</h4>
                      <p className="text-sm text-gray-500">{rule.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Content Structure */}
        <div className="card overflow-hidden">
          <button
            onClick={() => setStructureExpanded(!structureExpanded)}
            className="w-full p-5 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#3B5CFF]/10 flex items-center justify-center">
                <span className="text-xl">📝</span>
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-black">정보형 글 구조</h3>
                <p className="text-sm text-gray-500">6단계 구조로 글이 생성됩니다</p>
              </div>
            </div>
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform ${structureExpanded ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {structureExpanded && (
            <div className="p-5 pt-0 animate-fade-in">
              <div className="space-y-3 mt-4">
                {CONTENT_STRUCTURE.map((step, index) => (
                  <div key={step.step} className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#3B5CFF]/10 flex items-center justify-center flex-shrink-0 text-sm font-semibold text-[#3B5CFF]">
                      {step.step}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-black">{step.title}</h4>
                      <p className="text-xs text-gray-400">{step.description}</p>
                    </div>
                    {index < CONTENT_STRUCTURE.length - 1 && (
                      <div className="hidden" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Acknowledgment Checkbox */}
        <div className="mt-6 p-5 rounded-2xl bg-gray-50 border border-gray-200">
          <label className="flex items-start gap-4 cursor-pointer">
            <div className="relative flex-shrink-0 mt-0.5">
              <input
                type="checkbox"
                checked={acknowledged}
                onChange={(e) => setAcknowledged(e.target.checked)}
                className="sr-only"
              />
              <div
                className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all
                  ${acknowledged ? 'border-[#3B5CFF] bg-[#3B5CFF]' : 'border-gray-300 bg-white'}
                `}
              >
                {acknowledged && (
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </div>
            <div>
              <p className="font-medium text-black">
                위 규칙들을 확인했으며, 이에 따라 글이 생성되는 것에 동의합니다
              </p>
              <p className="text-sm text-gray-400 mt-1">
                규칙을 따르는 글은 신고 위험을 줄이고 검색 노출에 유리합니다
              </p>
            </div>
          </label>
        </div>

        {acknowledged && (
          <div className="text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#3B5CFF] text-white font-bold text-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              규칙 확인 완료
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
