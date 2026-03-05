'use client';

import { READER_STATES } from '@/data/constants';
import SelectionCard from '../SelectionCard';

interface StepReaderProps {
  selected: string | null;
  onSelect: (id: string) => void;
}

export default function StepReader({ selected, onSelect }: StepReaderProps) {
  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-black text-black mb-2">
          독자는 어떤 상태인가요?
        </h2>
        <p className="text-gray-500">
          독자의 마음 상태에 맞춰 글의 어조를 조절합니다
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
        {READER_STATES.map((state) => (
          <SelectionCard
            key={state.id}
            id={state.id}
            icon={state.icon}
            title={state.name}
            description={state.description}
            selected={selected === state.id}
            onClick={() => onSelect(state.id)}
          />
        ))}
      </div>

      <div className="mt-8 max-w-xl mx-auto">
        <div className="p-4 rounded-xl bg-[#3B5CFF]/5 border border-[#3B5CFF]/20">
          <div className="flex items-start gap-3">
            <span className="text-xl">💡</span>
            <div>
              <p className="text-sm text-gray-600">
                <strong className="text-black">Tip:</strong> 독자가 어떤 단계에 있는지 파악하면,
                그들에게 진짜 필요한 정보를 전달할 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
