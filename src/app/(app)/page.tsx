'use client';

import { useState, useCallback, useMemo } from 'react';
import StepProgress from '@/components/StepProgress';
import StepContentType from '@/components/steps/StepContentType';
import StepBusiness from '@/components/steps/StepBusiness';
import StepKeyword from '@/components/steps/StepKeyword';
import StepTopic from '@/components/steps/StepTopic';
import StepPurpose from '@/components/steps/StepPurpose';
import StepReader from '@/components/steps/StepReader';
import StepRules from '@/components/steps/StepRules';
import StepTitleSelect from '@/components/steps/StepTitleSelect';
import StepGenerate from '@/components/steps/StepGenerate';
import StepBrandingType from '@/components/steps/StepBrandingType';
import StepBrandingInfo from '@/components/steps/StepBrandingInfo';
import { FormData, ContentType, BrandingType, BrandingInfo } from '@/types';

const initialBrandingInfo: BrandingInfo = {
  intro: { experience: '', specialty: '', startReason: '', customerMind: '' },
  philosophy: { coreValue: '', difference: '', whyPhilosophy: '', message: '' },
};

const initialFormData: FormData = {
  contentType: 'seo',
  businessCategory: null,
  keyword: '',
  topic: null,
  purpose: null,
  readerState: null,
  rulesConfirmed: false,
  selectedTitle: '',
  additionalContext: '',
  brandingType: null,
  brandingInfo: initialBrandingInfo,
};

// SEO: 글유형 → 업종 → 키워드 → 주제 → 목적 → 독자상태 → 규칙 → 제목 → 생성
// Branding: 글유형 → 업종 → 브랜딩종류 → 키워드 → 추가정보 → 제목 → 생성

type StepId =
  | 'contentType'
  | 'business'
  | 'keyword'
  | 'topic'
  | 'purpose'
  | 'reader'
  | 'rules'
  | 'title'
  | 'generate'
  | 'brandingType'
  | 'brandingInfo';

export default function Home() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);

  // 현재 콘텐츠 타입에 따른 스텝 배열
  const steps: StepId[] = useMemo(() => {
    if (formData.contentType === 'seo') {
      return ['contentType', 'business', 'topic', 'keyword', 'purpose', 'reader', 'rules', 'title', 'generate'];
    } else {
      return ['contentType', 'business', 'brandingType', 'keyword', 'brandingInfo', 'title', 'generate'];
    }
  }, [formData.contentType]);

  const totalSteps = steps.length;
  const currentStepId = steps[currentStep - 1];
  const isGenerateStep = currentStepId === 'generate';

  const canProceed = useCallback(() => {
    switch (currentStepId) {
      case 'contentType':
        return true; // Always has a default value
      case 'business':
        return formData.businessCategory !== null;
      case 'keyword':
        return formData.keyword.trim().length > 0;
      case 'topic':
        return formData.topic !== null;
      case 'purpose':
        return formData.purpose !== null;
      case 'reader':
        return formData.readerState !== null;
      case 'rules':
        return formData.rulesConfirmed;
      case 'title':
        return formData.selectedTitle.trim().length > 0;
      case 'brandingType':
        return formData.brandingType !== null;
      case 'brandingInfo': {
        if (!formData.brandingType) return false;
        const info = formData.brandingInfo[formData.brandingType];
        // 해당 타입의 모든 필드 중 하나 이상 입력되었는지 확인
        return Object.values(info).some((v) => v.trim().length > 0);
      }
      default:
        return false;
    }
  }, [currentStepId, formData]);

  const handleNext = () => {
    if (canProceed() && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleReset = () => {
    setFormData(initialFormData);
    setCurrentStep(1);
  };

  const handleContentTypeChange = (type: ContentType) => {
    // 콘텐츠 타입 변경 시 관련 필드 리셋
    setFormData({
      ...initialFormData,
      contentType: type,
    });
  };

  const handleRulesConfirm = useCallback((confirmed: boolean) => {
    setFormData((prev) => ({ ...prev, rulesConfirmed: confirmed }));
  }, []);

  const renderStep = () => {
    switch (currentStepId) {
      case 'contentType':
        return (
          <StepContentType
            selected={formData.contentType}
            onSelect={handleContentTypeChange}
          />
        );
      case 'business':
        return (
          <StepBusiness
            selected={formData.businessCategory}
            onSelect={(id) =>
              setFormData({ ...formData, businessCategory: id })
            }
          />
        );
      case 'keyword':
        return (
          <StepKeyword
            value={formData.keyword}
            onChange={(value) => setFormData({ ...formData, keyword: value })}
            businessCategory={formData.businessCategory}
          />
        );
      case 'topic':
        return (
          <StepTopic
            selected={formData.topic}
            onSelect={(id) => setFormData({ ...formData, topic: id })}
            businessCategory={formData.businessCategory}
          />
        );
      case 'purpose':
        return (
          <StepPurpose
            selected={formData.purpose}
            onSelect={(id) => setFormData({ ...formData, purpose: id })}
          />
        );
      case 'reader':
        return (
          <StepReader
            selected={formData.readerState}
            onSelect={(id) => setFormData({ ...formData, readerState: id })}
          />
        );
      case 'rules':
        return (
          <StepRules
            businessCategory={formData.businessCategory}
            confirmed={formData.rulesConfirmed}
            onConfirm={handleRulesConfirm}
          />
        );
      case 'title':
        return (
          <StepTitleSelect
            value={formData.selectedTitle}
            onChange={(value) => setFormData({ ...formData, selectedTitle: value })}
            keyword={formData.keyword}
            businessCategory={formData.businessCategory || ''}
            topic={formData.contentType === 'seo' ? (formData.topic || '') : formData.brandingType || ''}
            purpose={formData.contentType === 'seo' ? (formData.purpose || '') : 'branding'}
            readerState={formData.readerState || ''}
            contentType={formData.contentType}
            brandingType={formData.brandingType}
            brandingInfo={formData.brandingInfo}
          />
        );
      case 'generate':
        return <StepGenerate onReset={handleReset} formData={formData} />;
      case 'brandingType':
        return (
          <StepBrandingType
            selected={formData.brandingType}
            onSelect={(type: BrandingType) => setFormData({ ...formData, brandingType: type })}
          />
        );
      case 'brandingInfo':
        return (
          <StepBrandingInfo
            value={formData.brandingInfo}
            onChange={(value) => setFormData({ ...formData, brandingInfo: value })}
            brandingType={formData.brandingType}
          />
        );
      default:
        return null;
    }
  };

  // 다음 버튼 텍스트
  const getNextButtonText = () => {
    if (currentStep === totalSteps - 1) {
      return '글 생성하기';
    }
    return '다음';
  };

  return (
    <div>
      {/* Progress */}
      <div className="mb-6">
        <StepProgress
          currentStep={currentStep}
          totalSteps={totalSteps}
          contentType={formData.contentType}
        />
      </div>

      {/* Step Content */}
      <div className="min-h-[400px]">{renderStep()}</div>

      {/* Bottom Navigation */}
      {!isGenerateStep && (
        <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className={`flex items-center gap-1 sm:gap-2 rounded-xl px-3 sm:px-5 py-2.5 text-sm font-medium transition-all
              ${
                currentStep === 1
                  ? 'text-slate-300 cursor-not-allowed'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }
            `}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span className="hidden sm:inline">이전</span>
          </button>

          <div className="text-xs text-slate-400">
            {currentStep} / {totalSteps}
          </div>

          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className={`flex items-center gap-1 sm:gap-2 rounded-xl px-3 sm:px-5 py-2.5 text-sm font-medium transition-all
              ${
                canProceed()
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-slate-100 text-slate-300 cursor-not-allowed'
              }
            `}
          >
            {getNextButtonText()}
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
