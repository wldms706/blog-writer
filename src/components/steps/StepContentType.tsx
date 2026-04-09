'use client';

import { ContentType, SeoStyle } from '@/types';
import SelectionCard from '../SelectionCard';

interface StepContentTypeProps {
  selected: ContentType;
  seoStyle: SeoStyle;
  onSelect: (type: ContentType, seoStyle?: SeoStyle) => void;
}

const CONTENT_OPTIONS = [
  {
    id: 'seo-review',
    icon: '📝',
    name: '상위노출 - 체험 후기형',
    description: '고객이 직접 방문한 것처럼 쓰는 후기 스타일',
  },
  {
    id: 'seo-expert',
    icon: '💡',
    name: '상위노출 - 전문가 정보형',
    description: '원장님이 전문 지식을 전달하는 스타일',
  },
  {
    id: 'branding',
    icon: '✨',
    name: '브랜딩 글',
    description: '샵의 가치와 철학을 전달하는 글',
  },
];

function getSelectedId(contentType: ContentType, seoStyle: SeoStyle): string {
  if (contentType === 'branding') return 'branding';
  return seoStyle === 'review' ? 'seo-review' : 'seo-expert';
}

export default function StepContentType({ selected, seoStyle, onSelect }: StepContentTypeProps) {
  const selectedId = getSelectedId(selected, seoStyle);

  const handleSelect = (id: string) => {
    if (id === 'branding') {
      onSelect('branding');
    } else if (id === 'seo-review') {
      onSelect('seo', 'review');
    } else {
      onSelect('seo', 'expert');
    }
  };

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

      <div className="grid grid-cols-1 gap-3 max-w-lg mx-auto">
        {CONTENT_OPTIONS.map((option) => (
          <SelectionCard
            key={option.id}
            id={option.id}
            icon={option.icon}
            title={option.name}
            description={option.description}
            selected={selectedId === option.id}
            onClick={() => handleSelect(option.id)}
          />
        ))}
      </div>

      {selectedId && (
        <div className="mt-6 text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#3B5CFF] text-white font-bold text-sm">
            {selectedId === 'seo-review' && <span>방문 후기처럼 자연스러운 스토리텔링 글을 작성합니다</span>}
            {selectedId === 'seo-expert' && <span>원장님의 전문 지식을 전달하는 정보형 글을 작성합니다</span>}
            {selectedId === 'branding' && <span>샵의 브랜드 가치를 전달하는 글을 작성합니다</span>}
          </div>
        </div>
      )}
    </div>
  );
}
