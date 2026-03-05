'use client';

import { SEO_STEPS, BRANDING_STEPS } from '@/data/constants';
import { ContentType } from '@/types';

interface StepProgressProps {
  currentStep: number;
  totalSteps?: number;
  contentType?: ContentType;
}

export default function StepProgress({ currentStep, totalSteps, contentType = 'seo' }: StepProgressProps) {
  const steps = contentType === 'seo' ? SEO_STEPS : BRANDING_STEPS;
  const total = totalSteps || steps.length;

  return (
    <div className="w-full max-w-3xl mx-auto px-4">
      {/* Mobile: Simple Progress Bar */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold text-black">
            {steps[currentStep - 1]?.title}
          </span>
          <span className="text-sm font-bold text-[#3B5CFF]">
            {currentStep} / {total}
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#3B5CFF] rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(currentStep / total) * 100}%` }}
          />
        </div>
      </div>

      {/* Desktop: Full Step Indicators */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between relative">
          {/* Connection Line Background */}
          <div className="absolute top-[18px] left-0 right-0 h-0.5 bg-gray-200" />

          {/* Progress Line */}
          <div
            className="absolute top-[18px] left-0 h-0.5 bg-black transition-all duration-500 ease-out"
            style={{ width: `${((currentStep - 1) / (total - 1)) * 100}%` }}
          />

          {steps.map((step) => (
            <div
              key={step.id}
              className="flex flex-col items-center relative z-10"
            >
              <div
                className={`step-indicator ${
                  step.id < currentStep
                    ? 'step-indicator-completed'
                    : step.id === currentStep
                    ? 'step-indicator-active'
                    : 'step-indicator-pending'
                }`}
              >
                {step.id < currentStep ? (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  step.id
                )}
              </div>
              <span
                className={`mt-2 text-xs font-bold text-center whitespace-nowrap transition-colors ${
                  step.id === currentStep
                    ? 'text-[#3B5CFF]'
                    : step.id < currentStep
                    ? 'text-black'
                    : 'text-gray-400'
                }`}
              >
                {step.title}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
