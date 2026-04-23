'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import StepProgress from '@/components/StepProgress';
import WeeklyStreak from '@/components/WeeklyStreak';
import StepContentType from '@/components/steps/StepContentType';
import StepBusiness from '@/components/steps/StepBusiness';
import StepKeyword from '@/components/steps/StepKeyword';
import StepTopic from '@/components/steps/StepTopic';
import StepTitleSelect from '@/components/steps/StepTitleSelect';
import StepGenerate from '@/components/steps/StepGenerate';
import StepBrandingType from '@/components/steps/StepBrandingType';
import StepBrandingInfo from '@/components/steps/StepBrandingInfo';
import StepTreatmentInfo from '@/components/steps/StepTreatmentInfo';
import StepTone from '@/components/steps/StepTone';
import { FormData, ContentType, SeoStyle, BrandingType, BrandingInfo, TonePreset } from '@/types';
import { BUSINESS_CATEGORIES } from '@/data/constants';
import { getProfile } from '@/lib/storage';
import { createClient } from '@/lib/supabase/client';

const initialBrandingInfo: BrandingInfo = {
  recruit: { courseName: '', targetStudent: '', curriculum: '', benefit: '' },
  philosophy: { coreValue: '', difference: '', whyPhilosophy: '', message: '' },
};

const initialFormData: FormData = {
  contentType: 'seo',
  seoStyle: 'review',
  businessCategory: null,
  keyword: '',
  topic: null,
  purpose: null,
  customPurpose: '',
  readerState: null,
  rulesConfirmed: false,
  selectedTitle: '',
  additionalContext: '',
  brandingType: null,
  brandingInfo: initialBrandingInfo,
  tonePreset: 'warm',
  shopAddress: '',
  shopHours: '',
  shopPhone: '',
  shopParking: '',
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
  | 'tone'
  | 'rules'
  | 'title'
  | 'generate'
  | 'brandingType'
  | 'brandingInfo'
  | 'treatmentInfo';

export default function Home() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);

  // 프로필에서 저장된 가게 정보 자동 로드
  useEffect(() => {
    async function loadShopInfo() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const profile = await getProfile(user.id);
        if (profile.shopAddress || profile.shopHours || profile.shopPhone || profile.shopParking) {
          setFormData(prev => ({
            ...prev,
            shopAddress: prev.shopAddress || profile.shopAddress,
            shopHours: prev.shopHours || profile.shopHours,
            shopPhone: prev.shopPhone || profile.shopPhone,
            shopParking: prev.shopParking || profile.shopParking,
          }));
        }
      }
    }
    loadShopInfo();
  }, []);

  // 규제 업종 여부
  const isRegulated = BUSINESS_CATEGORIES.find(b => b.id === formData.businessCategory)?.hasRegulation ?? false;

  // 현재 콘텐츠 타입에 따른 스텝 배열
  const steps: StepId[] = useMemo(() => {
    if (formData.contentType === 'seo') {
      const isReview = formData.seoStyle === 'review';
      if (isRegulated && !isReview) {
        return ['contentType', 'business', 'topic', 'keyword', 'treatmentInfo', 'title', 'generate'];
      }
      return ['contentType', 'business', 'topic', 'keyword', 'treatmentInfo', 'tone', 'title', 'generate'];
    } else {
      if (isRegulated) {
        return ['contentType', 'business', 'brandingType', 'keyword', 'brandingInfo', 'title', 'generate'];
      }
      // 일반 업종 브랜딩: 브랜딩정보 다음에 톤 선택 추가
      return ['contentType', 'business', 'brandingType', 'keyword', 'brandingInfo', 'tone', 'title', 'generate'];
    }
  }, [formData.contentType, isRegulated]);

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
      case 'tone':
        return true; // 기본값이 있으므로 항상 진행 가능
      case 'treatmentInfo':
        // 선택사항이므로 항상 다음으로 넘어갈 수 있음
        return true;
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

  const handleContentTypeChange = (type: ContentType, seoStyle?: SeoStyle) => {
    setFormData(prev => ({
      ...initialFormData,
      contentType: type,
      seoStyle: seoStyle || 'review',
      shopAddress: prev.shopAddress,
      shopHours: prev.shopHours,
      shopPhone: prev.shopPhone,
      shopParking: prev.shopParking,
    }));
  };



  const renderStep = () => {
    switch (currentStepId) {
      case 'contentType':
        return (
          <StepContentType
            selected={formData.contentType}
            seoStyle={formData.seoStyle}
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
            topic={formData.contentType === 'seo' ? formData.topic : formData.brandingType}
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
            seoStyle={formData.seoStyle}
            brandingType={formData.brandingType}
            brandingInfo={formData.brandingInfo}
          />
        );
      case 'generate':
        return <StepGenerate onReset={handleReset} formData={formData} isRegulated={isRegulated} />;
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
      case 'treatmentInfo':
        return (
          <StepTreatmentInfo
            value={formData.additionalContext}
            onChange={(value) => setFormData((prev) => ({ ...prev, additionalContext: value }))}
            customPurpose={formData.customPurpose}
            onCustomPurposeChange={(text) => setFormData((prev) => ({ ...prev, customPurpose: text }))}
            isRegulated={isRegulated}
          />
        );
      case 'tone':
        return (
          <StepTone
            selected={formData.tonePreset}
            onSelect={(tone: TonePreset) => setFormData({ ...formData, tonePreset: tone })}
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
      {/* Weekly Streak */}
      {currentStep === 1 && <WeeklyStreak />}

      {/* Progress */}
      <div className="mb-6">
        <StepProgress
          currentStep={currentStep}
          totalSteps={totalSteps}
          contentType={formData.contentType}
          isRegulated={isRegulated}
        />
      </div>

      {/* Step Content */}
      <div className="min-h-[400px]">{renderStep()}</div>

      {/* Bottom Navigation */}
      {!isGenerateStep && (
        <div className="mt-6 flex items-center justify-between border-t-2 border-gray-100 pt-4">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className={`flex items-center gap-1 sm:gap-2 rounded-xl px-3 sm:px-5 py-2.5 text-sm font-medium transition-all
              ${
                currentStep === 1
                  ? 'text-gray-200 cursor-not-allowed'
                  : 'text-gray-400 hover:text-black hover:bg-gray-100'
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

          <div className="text-xs font-bold text-gray-400">
            {currentStep} / {totalSteps}
          </div>

          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className={`flex items-center gap-1 sm:gap-2 rounded-xl px-3 sm:px-5 py-2.5 text-sm font-medium transition-all
              ${
                canProceed()
                  ? 'bg-[#3B5CFF] text-white hover:bg-[#2A45E0] rounded-full font-bold'
                  : 'bg-gray-100 text-gray-300 cursor-not-allowed rounded-full'
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
