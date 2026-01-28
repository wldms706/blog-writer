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
        <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">
          포지션이 설정되었습니다
        </h2>
        <p className="text-text-secondary">
          이 포지션은 안전한 글쓰기를 위해 자동 고정됩니다
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Summary Card */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="text-primary">📋</span>
            </span>
            선택 요약
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-border-light">
              <span className="text-text-muted text-sm">업종</span>
              <span className="font-medium text-text-primary flex items-center gap-2">
                {business?.icon} {business?.name}
                {hasRegulation && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-warning/10 text-warning">
                    규제 업종
                  </span>
                )}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border-light">
              <span className="text-text-muted text-sm">주제</span>
              <span className="font-medium text-text-primary flex items-center gap-2">
                {topic?.icon} {topic?.name}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border-light">
              <span className="text-text-muted text-sm">목적</span>
              <span className="font-medium text-text-primary">{purpose?.name}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-text-muted text-sm">독자 상태</span>
              <span className="font-medium text-text-primary flex items-center gap-2">
                {reader?.icon} {reader?.name}
              </span>
            </div>
          </div>
        </div>

        {/* Position Statement */}
        <div className="card p-6 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-primary mb-1">글의 포지션</h4>
              <p className="text-text-secondary text-sm leading-relaxed">
                {hasRegulation ? POSITION_STATEMENTS.regulated : POSITION_STATEMENTS.default}
              </p>
            </div>
          </div>
        </div>

        {/* Lock Notice */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background-subtle text-text-muted text-sm">
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
