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
        <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">
          글의 톤을 선택해주세요
        </h2>
        <p className="text-text-secondary">
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
              <div className="mt-2 ml-14 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-sm text-slate-500 italic">{tone.example}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
