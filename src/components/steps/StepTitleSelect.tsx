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
        <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">
          블로그 제목을 선택해주세요
        </h2>
        <p className="text-text-secondary">
          {contentType === 'seo'
            ? '클릭률을 높이는 AI 추천 제목 중 하나를 선택하세요'
            : '브랜드 가치를 담은 AI 추천 제목 중 하나를 선택하세요'}
        </p>
      </div>

      <div className="max-w-xl mx-auto space-y-6">
        {/* 로딩 상태 */}
        {loading && (
          <div className="text-center py-8">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600 mb-3" />
            <p className="text-sm text-slate-500">AI가 매력적인 제목을 만들고 있습니다...</p>
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
              <label className="block text-sm font-medium text-slate-700">AI 추천 제목</label>
              <div className="space-y-3">
                {titles.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => onChange(item.title)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      value === item.title
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 bg-white hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className={`font-medium leading-snug ${value === item.title ? 'text-blue-700' : 'text-slate-800'}`}>
                        {item.title}
                      </span>
                      {value === item.title && (
                        <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1.5">{item.style}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* 다시 추천받기 */}
            <button
              onClick={fetchTitles}
              className="w-full py-2 text-sm text-slate-500 hover:text-slate-700"
            >
              다른 제목 추천받기
            </button>
          </div>
        )}

        {/* 직접 입력 토글 */}
        <div className="border-t border-slate-100 pt-4">
          <button
            onClick={() => setShowManualInput(!showManualInput)}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700"
          >
            <span>{showManualInput ? '▼' : '▶'}</span>
            <span>직접 제목 입력하기</span>
          </button>

          {showManualInput && (
            <div className="mt-3 space-y-2 animate-fade-in">
              <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="직접 제목을 입력하세요"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
              />
              <p className="text-xs text-slate-400">
                추천 제목 대신 원하는 제목을 직접 입력할 수 있습니다
              </p>
            </div>
          )}
        </div>

        {/* 선택된 제목 표시 */}
        {value && (
          <div className="text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-green-50 text-green-700 text-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>선택된 제목: <strong>{value}</strong></span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
