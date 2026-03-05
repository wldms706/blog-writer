'use client';

import { useState, useEffect } from 'react';
import { ContentType, BrandingType, BrandingInfo } from '@/types';

interface TitleOption {
  title: string;
  style: string;
}

interface StepTitleSelectProps {
  value: string;
  onChange: (value: string) => void;
  keyword: string;
  businessCategory: string;
  topic: string;
  purpose: string;
  readerState: string;
  contentType?: ContentType;
  brandingType?: BrandingType | null;
  brandingInfo?: BrandingInfo;
}

export default function StepTitleSelect({
  value,
  onChange,
  keyword,
  businessCategory,
  topic,
  purpose,
  readerState,
  contentType = 'seo',
  brandingType,
  brandingInfo,
}: StepTitleSelectProps) {
  const [titles, setTitles] = useState<TitleOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showManualInput, setShowManualInput] = useState(false);

  useEffect(() => {
    fetchTitles();
  }, []);

  const fetchTitles = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/generate-titles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyword,
          businessCategory,
          topic,
          purpose,
          readerState,
          contentType,
          brandingType,
          brandingInfo,
        }),
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else if (data.titles && data.titles.length > 0) {
        setTitles(data.titles);
      }
    } catch {
      setError('제목 생성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-black text-black mb-2">
          블로그 제목을 선택해주세요
        </h2>
        <p className="text-gray-500">
          {contentType === 'seo'
            ? '클릭률을 높이는 AI 추천 제목 중 하나를 선택하세요'
            : '브랜드 가치를 담은 AI 추천 제목 중 하나를 선택하세요'}
        </p>
      </div>

      <div className="max-w-xl mx-auto space-y-6">
        {/* 로딩 상태 */}
        {loading && (
          <div className="text-center py-8">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-[#3B5CFF] mb-3" />
            <p className="text-sm text-gray-500">AI가 매력적인 제목을 만들고 있습니다...</p>
          </div>
        )}

        {/* 에러 */}
        {error && !loading && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-100">
            <p className="text-sm text-red-600">{error}</p>
            <button
              onClick={fetchTitles}
              className="mt-2 text-sm text-red-700 underline"
            >
              다시 시도
            </button>
          </div>
        )}

        {/* AI 추천 제목 */}
        {!loading && titles.length > 0 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-black">AI 추천 제목</label>
              <div className="space-y-3">
                {titles.map((item, idx) => {
                  const isSelected = value === item.title || (value && titles.every(t => t.title !== value) === false && titles[idx].title === value);
                  const isActive = value === item.title;
                  return (
                    <div key={idx}>
                      <button
                        onClick={() => onChange(item.title)}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                          isActive
                            ? 'border-[#3B5CFF] bg-[#3B5CFF]/5'
                            : 'border-gray-200 bg-white hover:border-[#3B5CFF]/50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className={`font-medium leading-snug ${isActive ? 'text-[#3B5CFF]' : 'text-black'}`}>
                            {item.title}
                          </span>
                          {isActive && (
                            <svg className="w-5 h-5 text-[#3B5CFF] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1.5">{item.style}</p>
                      </button>

                      {/* 선택된 제목 바로 아래에 수정 입력란 */}
                      {isActive && (
                        <div className="mt-2 animate-fade-in">
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-t-lg bg-[#3B5CFF]/10">
                            <svg className="w-3.5 h-3.5 text-[#3B5CFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            <span className="text-xs font-medium text-[#3B5CFF]">제목 수정 (선택사항)</span>
                          </div>
                          <input
                            type="text"
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            className="w-full rounded-b-xl border-2 border-t-0 border-[#3B5CFF]/30 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-[#3B5CFF]"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 다시 추천받기 */}
            <button
              onClick={fetchTitles}
              className="w-full py-2 text-sm text-gray-500 hover:text-gray-700"
            >
              다른 제목 추천받기
            </button>
          </div>
        )}

        {/* 직접 입력 */}
        <div className="border-t border-gray-100 pt-4">
          <button
            onClick={() => setShowManualInput(!showManualInput)}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
          >
            <span>{showManualInput ? '▼' : '▶'}</span>
            <span>제목 직접 입력하기</span>
          </button>

          {showManualInput && (
            <div className="mt-3 space-y-2 animate-fade-in">
              <input
                type="text"
                value={titles.every(t => t.title !== value) ? value : ''}
                onChange={(e) => onChange(e.target.value)}
                placeholder="원하는 제목을 직접 입력하세요"
                className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#3B5CFF]"
              />
              <p className="text-xs text-gray-400">
                입력한 제목을 기준으로 내용이 생성됩니다
              </p>
            </div>
          )}
        </div>

        {/* 선택/입력된 제목 확인 */}
        {value && (
          <div className="rounded-xl bg-[#3B5CFF] px-4 py-3 animate-fade-in">
            <p className="text-xs text-white/70 mb-0.5">최종 제목</p>
            <p className="text-sm font-bold text-white leading-snug">{value}</p>
          </div>
        )}
      </div>
    </div>
  );
}
