'use client';

import { BrandingType } from '@/types';
import SelectionCard from '../SelectionCard';

interface StepBrandingTypeProps {
  selected: BrandingType | null;
  onSelect: (type: BrandingType) => void;
  businessCategory: string | null;
}

type BrandingOption = {
  id: BrandingType;
  icon: string;
  name: string;
  description: string;
  badge?: string;
};

const BRANDING_TYPES: BrandingOption[] = [
  {
    id: 'intro',
    icon: '👋',
    name: '자기소개',
    description: '원장님을 소개하는 글',
  },
  {
    id: 'philosophy',
    icon: '💭',
    name: '철학/신념',
    description: '왜 이 일을 하는지, 어떤 가치를 추구하는지',
  },
];

const STORY_TYPE: BrandingOption = {
  id: 'story',
  icon: '📖',
  name: '소설식',
  description: '가상 인물의 시선으로 쓰는 공감 글',
  badge: '반영구 전용',
};

export default function StepBrandingType({ selected, onSelect, businessCategory }: StepBrandingTypeProps) {
  const isRegulatedBusiness = businessCategory === 'semi-permanent' || businessCategory === '반영구';

  // 반영구인 경우 소설식 옵션 추가
  const availableTypes = isRegulatedBusiness
    ? [...BRANDING_TYPES, STORY_TYPE]
    : BRANDING_TYPES;
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

      <div className={`grid grid-cols-1 gap-4 max-w-2xl mx-auto ${availableTypes.length === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
        {availableTypes.map((type) => (
          <SelectionCard
            key={type.id}
            id={type.id}
            icon={type.icon}
            title={type.name}
            description={type.description}
            selected={selected === type.id}
            onClick={() => onSelect(type.id)}
            badge={type.badge}
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
              {selected === 'story' && '가상 인물의 고민과 여정을 담은 공감 글을 작성합니다'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
