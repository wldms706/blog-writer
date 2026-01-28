'use client';

import { useState, useCallback } from 'react';
import Header from '@/components/Header';
import StepProgress from '@/components/StepProgress';
import StepBusiness from '@/components/steps/StepBusiness';
import StepKeyword from '@/components/steps/StepKeyword';
import StepTopic from '@/components/steps/StepTopic';
import StepPurpose from '@/components/steps/StepPurpose';
import StepReader from '@/components/steps/StepReader';
import StepRules from '@/components/steps/StepRules';
import StepGenerate from '@/components/steps/StepGenerate';
import { FormData } from '@/types';

const initialFormData: FormData = {
  businessCategory: null,
  keyword: '',
  topic: null,
  purpose: null,
  readerState: null,
  rulesConfirmed: false,
  additionalContext: '',
};

export default function Home() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.businessCategory !== null;
      case 2:
        return formData.keyword.trim().length > 0;
      case 3:
        return formData.topic !== null;
      case 4:
        return formData.purpose !== null;
      case 5:
        return formData.readerState !== null;
      case 6:
        return formData.rulesConfirmed;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (canProceed() && currentStep < 7) {
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

  const handleRulesConfirm = useCallback((confirmed: boolean) => {
    setFormData((prev) => ({ ...prev, rulesConfirmed: confirmed }));
  }, []);

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <StepBusiness
            selected={formData.businessCategory}
            onSelect={(id) =>
              setFormData({ ...formData, businessCategory: id })
            }
          />
        );
      case 2:
        return (
          <StepKeyword
            value={formData.keyword}
            onChange={(value) => setFormData({ ...formData, keyword: value })}
          />
        );
      case 3:
        return (
          <StepTopic
            selected={formData.topic}
            onSelect={(id) => setFormData({ ...formData, topic: id })}
          />
        );
      case 4:
        return (
          <StepPurpose
            selected={formData.purpose}
            onSelect={(id) => setFormData({ ...formData, purpose: id })}
          />
        );
      case 5:
        return (
          <StepReader
            selected={formData.readerState}
            onSelect={(id) => setFormData({ ...formData, readerState: id })}
          />
        );
      case 6:
        return (
          <StepRules
            businessCategory={formData.businessCategory}
            confirmed={formData.rulesConfirmed}
            onConfirm={handleRulesConfirm}
          />
        );
      case 7:
        return <StepGenerate onReset={handleReset} formData={formData} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-32">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Progress */}
          <div className="mb-12">
            <StepProgress currentStep={currentStep} />
          </div>

          {/* Step Content */}
          <div className="min-h-[500px]">{renderStep()}</div>
        </div>
      </main>

      {/* Bottom Navigation */}
      {currentStep < 7 && (
        <div className="fixed bottom-0 left-0 right-0 glass border-t border-border-light">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={handleBack}
                disabled={currentStep === 1}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all
                  ${
                    currentStep === 1
                      ? 'text-text-muted cursor-not-allowed'
                      : 'text-text-secondary hover:text-text-primary hover:bg-background-subtle'
                  }
                `}
              >
                <svg
                  className="w-5 h-5"
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
                이전
              </button>

              <div className="text-sm text-text-muted">
                {currentStep} / 7 단계
              </div>

              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all
                  ${
                    canProceed()
                      ? 'btn-primary'
                      : 'bg-background-subtle text-text-muted cursor-not-allowed'
                  }
                `}
              >
                {currentStep === 6 ? '글 생성하기' : '다음'}
                <svg
                  className="w-5 h-5"
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
          </div>
        </div>
      )}
    </div>
  );
}
