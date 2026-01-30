'use client';

import { BUSINESS_CATEGORIES } from '@/data/constants';
import SelectionCard from '../SelectionCard';

interface StepBusinessProps {
  selected: string | null;
  onSelect: (id: string) => void;
}

export default function StepBusiness({ selected, onSelect }: StepBusinessProps) {
  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">
          어떤 업종인가요?
        </h2>
        <p className="text-text-secondary">
          업종에 따라 글의 톤과 주의사항이 달라집니다
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
        {BUSINESS_CATEGORIES.map((category) => (
          <SelectionCard
            key={category.id}
            id={category.id}
            icon={category.icon}
            title={category.name}
            description={category.description}
            selected={selected === category.id}
            onClick={() => onSelect(category.id)}
            badge={category.hasRegulation ? '표현 규제' : undefined}
          />
        ))}
      </div>

      {selected && (
        <div className="mt-6 text-center animate-fade-in">
          {BUSINESS_CATEGORIES.find((c) => c.id === selected)?.hasRegulation && (
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-warning/10 text-warning text-xs sm:text-sm">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>표현 규제가 있는 업종입니다</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
