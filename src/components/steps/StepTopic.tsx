'use client';

import { TOPIC_CATEGORIES } from '@/data/constants';
import SelectionCard from '../SelectionCard';

interface StepTopicProps {
  selected: string | null;
  onSelect: (id: string) => void;
}

export default function StepTopic({ selected, onSelect }: StepTopicProps) {
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
        {TOPIC_CATEGORIES.map((topic) => (
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
    </div>
  );
}
