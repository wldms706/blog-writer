'use client';

import { BrandingType } from '@/types';
import SelectionCard from '../SelectionCard';

interface StepBrandingTypeProps {
  selected: BrandingType | null;
  onSelect: (type: BrandingType) => void;
}

const BRANDING_TYPES = [
  {
    id: 'intro' as BrandingType,
    icon: '👋',
    name: '자기소개',
    description: '원장님을 소개하는 글',
  },
  {
    id: 'philosophy' as BrandingType,
    icon: '💭',
    name: '철학/신념',
    description: '왜 이 일을 하는지, 어떤 가치를 추구하는지',
  },
  {
    id: 'story' as BrandingType,
    icon: '🏠',
    name: '샵 스토리',
    description: '샵의 역사, 공간, 분위기 소개',
  },
];

export default function StepBrandingType({ selected, onSelect }: StepBrandingTypeProps) {
  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">
          어떤 브랜딩 글인가요?
        </h2>
        <p className="text-text-secondary">
          글의 종류에 따라 구성이 달라집니다
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
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
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-50 text-purple-700 text-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              {selected === 'intro' && '원장님의 경력, 가치관, 인사말을 담은 글을 작성합니다'}
              {selected === 'philosophy' && '샵이 추구하는 가치와 철학을 담은 글을 작성합니다'}
              {selected === 'story' && '샵의 시작, 공간, 분위기를 소개하는 글을 작성합니다'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
