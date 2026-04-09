'use client';

import { SeoStyle } from '@/types';
import SelectionCard from '../SelectionCard';

interface StepSeoStyleProps {
  selected: SeoStyle;
  onSelect: (style: SeoStyle) => void;
}

const SEO_STYLES = [
  {
    id: 'review' as SeoStyle,
    icon: '📝',
    name: '체험 후기형',
    description: '고객이 직접 방문한 것처럼 쓰는 후기 스타일',
  },
  {
    id: 'expert' as SeoStyle,
    icon: '💡',
    name: '전문가 정보형',
    description: '원장님이 전문 지식을 전달하는 스타일',
  },
];

export default function StepSeoStyle({ selected, onSelect }: StepSeoStyleProps) {
  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-black text-black mb-2">
          글 스타일을 선택해주세요
        </h2>
        <p className="text-gray-500">
          같은 키워드라도 스타일에 따라 글의 느낌이 완전히 달라집니다
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
        {SEO_STYLES.map((style) => (
          <SelectionCard
            key={style.id}
            id={style.id}
            icon={style.icon}
            title={style.name}
            description={style.description}
            selected={selected === style.id}
            onClick={() => onSelect(style.id)}
          />
        ))}
      </div>

      {selected && (
        <div className="mt-6 text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#3B5CFF] text-white font-bold text-sm">
            {selected === 'review' ? (
              <span>방문 후기처럼 자연스러운 스토리텔링 글을 작성합니다</span>
            ) : (
              <span>원장님의 전문 지식을 전달하는 정보형 글을 작성합니다</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
