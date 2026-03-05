'use client';

import { BrandingType } from '@/types';
import SelectionCard from '../SelectionCard';

interface StepBrandingTypeProps {
  selected: BrandingType | null;
  onSelect: (type: BrandingType) => void;
}

type BrandingOption = {
  id: BrandingType;
  icon: string;
  name: string;
  description: string;
};

const BRANDING_TYPES: BrandingOption[] = [
  {
    id: 'recruit',
    icon: '🎓',
    name: '수강생 모집',
    description: '교육 과정 안내 및 수강생 모집 글',
  },
  {
    id: 'philosophy',
    icon: '💭',
    name: '철학/신념',
    description: '왜 이 일을 하는지, 어떤 가치를 추구하는지',
  },
];

export default function StepBrandingType({ selected, onSelect }: StepBrandingTypeProps) {
  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-black text-black mb-2">
          어떤 브랜딩 글인가요?
        </h2>
        <p className="text-gray-500">
          글의 종류에 따라 구성이 달라집니다
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
        {BRANDING_TYPES.map((type) => (
          <SelectionCard
            key={type.id}
            id={type.id}
            icon={type.icon}
            title={type.name}
            description={type.description}
            selected={selected === type.id}
            onClick={() => onSelect(type.id)}
          />
        ))}
      </div>

      {selected && (
        <div className="mt-6 text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#3B5CFF] text-white font-bold text-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              {selected === 'recruit' && '교육 과정 소개와 수강생 모집을 위한 글을 작성합니다'}
              {selected === 'philosophy' && '샵이 추구하는 가치와 철학을 담은 글을 작성합니다'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
