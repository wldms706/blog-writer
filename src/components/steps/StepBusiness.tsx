'use client';

import { BUSINESS_CATEGORIES } from '@/data/constants';
import SelectionCard from '../SelectionCard';
import Link from 'next/link';

interface StepBusinessProps {
  selected: string | null;
  onSelect: (id: string) => void;
  userPlanType?: string | null;
}

export default function StepBusiness({ selected, onSelect, userPlanType }: StepBusinessProps) {
  // 일반 플랜(pro_general)이면 반영구 숨김
  // 반영구 플랜(pro_permanent)이면 전부 보임
  // 무료(null)면 전부 보임 (체험용)
  const isGeneralPlan = userPlanType === 'pro_general';

  const visibleCategories = isGeneralPlan
    ? BUSINESS_CATEGORIES.filter((c) => c.id !== 'semi-permanent')
    : BUSINESS_CATEGORIES;

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-black text-black mb-2">
          어떤 업종인가요?
        </h2>
        <p className="text-gray-500">
          업종에 따라 글의 톤과 주의사항이 달라집니다
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
        {visibleCategories.map((category) => (
          <SelectionCard
            key={category.id}
            id={category.id}
            icon={category.icon}
            title={category.name}
            description={category.description}
            selected={selected === category.id}
            onClick={() => onSelect(category.id)}
          />
        ))}
      </div>

      {isGeneralPlan && (
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400 mb-2">
            반영구 업종은 프로(반영구) 플랜에서 이용할 수 있습니다
          </p>
          <Link href="/subscribe" className="text-xs text-[#3B5CFF] font-medium hover:underline">
            플랜 업그레이드
          </Link>
        </div>
      )}
    </div>
  );
}
