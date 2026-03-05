'use client';

import { BUSINESS_CATEGORIES, TOPIC_CATEGORIES, PURPOSES, READER_STATES, POSITION_STATEMENTS } from '@/data/constants';

interface StepPositionProps {
  formData: {
    businessCategory: string | null;
    topic: string | null;
    purpose: string | null;
    readerState: string | null;
  };
}

export default function StepPosition({ formData }: StepPositionProps) {
  const business = BUSINESS_CATEGORIES.find((b) => b.id === formData.businessCategory);
  const topic = TOPIC_CATEGORIES.find((t) => t.id === formData.topic);
  const purpose = PURPOSES.find((p) => p.id === formData.purpose);
  const reader = READER_STATES.find((r) => r.id === formData.readerState);

  const hasRegulation = business?.hasRegulation;

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-black text-black mb-2">
          포지션이 설정되었습니다
        </h2>
        <p className="text-gray-500">
          이 포지션은 안전한 글쓰기를 위해 자동 고정됩니다
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Summary Card */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-[#3B5CFF]/10 flex items-center justify-center">
              <span className="text-[#3B5CFF]">📋</span>
            </span>
            선택 요약
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <span className="text-gray-400 text-sm">업종</span>
              <span className="font-medium text-black flex items-center gap-2">
                {business?.icon} {business?.name}
                {hasRegulation && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500 text-white font-bold">
                    규제 업종
                  </span>
                )}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <span className="text-gray-400 text-sm">주제</span>
              <span className="font-medium text-black flex items-center gap-2">
                {topic?.icon} {topic?.name}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-200">
              <span className="text-gray-400 text-sm">목적</span>
              <span className="font-medium text-black">{purpose?.name}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-gray-400 text-sm">독자 상태</span>
              <span className="font-medium text-black flex items-center gap-2">
                {reader?.icon} {reader?.name}
              </span>
            </div>
          </div>
        </div>

        {/* Position Statement */}
        <div className="card p-6 bg-[#3B5CFF]/5 border-[#3B5CFF]/20">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#3B5CFF]/10 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-[#3B5CFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-[#3B5CFF] mb-1">글의 포지션</h4>
              <p className="text-gray-500 text-sm leading-relaxed">
                {hasRegulation ? POSITION_STATEMENTS.regulated : POSITION_STATEMENTS.default}
              </p>
            </div>
          </div>
        </div>

        {/* Lock Notice */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-gray-400 text-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            이 포지션은 수정할 수 없습니다
          </div>
        </div>
      </div>
    </div>
  );
}
