'use client';

import { getTopicsForBusiness, BUSINESS_SPECIFIC_TOPICS, COMMON_TOPICS } from '@/data/constants';
import SelectionCard from '../SelectionCard';

interface StepTopicProps {
  selected: string | null;
  onSelect: (id: string) => void;
  businessCategory: string | null;
}

export default function StepTopic({ selected, onSelect, businessCategory }: StepTopicProps) {
  const topics = getTopicsForBusiness(businessCategory);
  const hasSpecificTopics = businessCategory && BUSINESS_SPECIFIC_TOPICS[businessCategory]?.length > 0;
  const specificTopics = businessCategory ? BUSINESS_SPECIFIC_TOPICS[businessCategory] || [] : [];

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">
          어떤 주제로 글을 쓸까요?
        </h2>
        <p className="text-text-secondary">
          주제에 따라 글의 구조와 방향이 결정됩니다
        </p>
      </div>

      {/* 업종별 세부 주제가 있는 경우 */}
      {hasSpecificTopics && (
        <>
          <div className="mb-4">
            <h3 className="text-sm font-medium text-slate-500 mb-3 text-center">시술/고민별 주제</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 max-w-4xl mx-auto">
              {specificTopics.map((topic) => (
                <SelectionCard
                  key={topic.id}
                  id={topic.id}
                  icon={topic.icon}
                  title={topic.name}
                  description={topic.description}
                  selected={selected === topic.id}
                  onClick={() => onSelect(topic.id)}
                  compact
                />
              ))}
            </div>
          </div>

          <div className="my-6 flex items-center gap-4 max-w-4xl mx-auto">
            <div className="flex-1 h-px bg-slate-200"></div>
            <span className="text-xs text-slate-400">또는</span>
            <div className="flex-1 h-px bg-slate-200"></div>
          </div>

          <div className="mb-4">
            <h3 className="text-sm font-medium text-slate-500 mb-3 text-center">일반 주제</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-3xl mx-auto">
              {COMMON_TOPICS.map((topic) => (
                <SelectionCard
                  key={topic.id}
                  id={topic.id}
                  icon={topic.icon}
                  title={topic.name}
                  description={topic.description}
                  selected={selected === topic.id}
                  onClick={() => onSelect(topic.id)}
                  compact
                />
              ))}
            </div>
          </div>
        </>
      )}

      {/* 업종별 세부 주제가 없는 경우 기존처럼 표시 */}
      {!hasSpecificTopics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {topics.map((topic) => (
            <SelectionCard
              key={topic.id}
              id={topic.id}
              icon={topic.icon}
              title={topic.name}
              description={topic.description}
              selected={selected === topic.id}
              onClick={() => onSelect(topic.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
