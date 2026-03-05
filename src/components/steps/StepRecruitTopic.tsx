'use client';

interface StepRecruitTopicProps {
  value: string;
  onChange: (value: string) => void;
}

export default function StepRecruitTopic({ value, onChange }: StepRecruitTopicProps) {
  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-black text-black mb-2">
          어떤 수강 글을 쓰고 싶으세요?
        </h2>
        <p className="text-gray-500">
          지역 + 수강 주제를 함께 입력해주세요
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="예: 천안 반영구수강, 강남 엠보교정, 대전 두피문신 수강"
          autoFocus
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#3B5CFF] focus:ring-2 focus:ring-[#3B5CFF]/20 outline-none text-black placeholder:text-gray-400 transition-all text-center"
        />

        <div className="mt-4 flex items-start gap-3 p-4 rounded-xl bg-[#3B5CFF]/5 border border-[#3B5CFF]/20">
          <svg className="w-5 h-5 text-[#3B5CFF] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-black">
            <p className="font-medium mb-1">입력 팁</p>
            <ul className="space-y-1 text-gray-600">
              <li>- 지역명을 앞에 붙이면 제목에 지역이 반영됩니다</li>
              <li>- 이 값이 그대로 SEO 키워드로 사용됩니다</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
