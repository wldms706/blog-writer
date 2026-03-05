'use client';

import { ContentType } from '@/types';
import SelectionCard from '../SelectionCard';

interface StepContentTypeProps {
  selected: ContentType;
  onSelect: (type: ContentType) => void;
}

const CONTENT_TYPES = [
  {
    id: 'seo' as ContentType,
    icon: '🔍',
    name: '네이버 상위노출 글쓰기',
    description: '검색 노출을 위한 정보 전달 글',
  },
  {
    id: 'branding' as ContentType,
    icon: '✨',
    name: '브랜딩 글',
    description: '샵의 가치와 철학을 전달하는 글',
  },
];

export default function StepContentType({ selected, onSelect }: StepContentTypeProps) {
  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-black text-black mb-2">
          어떤 글을 작성할까요?
        </h2>
        <p className="text-gray-500">
          목적에 따라 글의 구조와 톤이 달라집니다
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
        {CONTENT_TYPES.map((type) => (
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
            {selected === 'seo' ? (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>키워드 중심의 정보 전달 글을 작성합니다</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                <span>샵의 브랜드 가치를 전달하는 글을 작성합니다</span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
