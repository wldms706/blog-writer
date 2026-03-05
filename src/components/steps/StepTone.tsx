'use client';

import { TonePreset } from '@/types';
import { TONE_PRESETS } from '@/data/constants';
import SelectionCard from '@/components/SelectionCard';

interface StepToneProps {
  selected: TonePreset;
  onSelect: (tone: TonePreset) => void;
}

export default function StepTone({ selected, onSelect }: StepToneProps) {
  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-black text-black mb-2">
          글의 톤을 선택해주세요
        </h2>
        <p className="text-gray-500">
          원장님의 블로그 스타일에 맞는 문체를 골라주세요
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-3">
        {TONE_PRESETS.map((tone) => (
          <div key={tone.id}>
            <SelectionCard
              id={tone.id}
              icon={tone.icon}
              title={tone.name}
              description={tone.description}
              selected={selected === tone.id}
              onClick={() => onSelect(tone.id)}
            />
            {selected === tone.id && (
              <div className="mt-2 ml-14 px-4 py-2.5 rounded-xl bg-black/5 border-none">
                <p className="text-sm text-gray-500 italic">{tone.example}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
