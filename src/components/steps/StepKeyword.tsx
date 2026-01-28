'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface RecommendedKeyword {
  keyword: string;
  reason: string;
}

interface StepKeywordProps {
  value: string;
  onChange: (value: string) => void;
  businessCategory: string | null;
}

export default function StepKeyword({ value, onChange, businessCategory }: StepKeywordProps) {
  const [recommendedKeywords, setRecommendedKeywords] = useState<RecommendedKeyword[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsLocation, setNeedsLocation] = useState(false);
  const [needsBlogIndex, setNeedsBlogIndex] = useState(false);
  const [blogIndexLevel, setBlogIndexLevel] = useState<string | null>(null);
  const [location, setLocation] = useState<string>('');
  const [showManualInput, setShowManualInput] = useState(false);

  useEffect(() => {
    if (businessCategory) {
      fetchRecommendations();
    }
  }, [businessCategory]);

  const fetchRecommendations = async () => {
    if (!businessCategory) return;

    setLoading(true);
    setError(null);
    setNeedsLocation(false);
    setNeedsBlogIndex(false);

    try {
      const res = await fetch('/api/recommend-keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessCategory }),
      });

      const data = await res.json();

      if (data.needsLocation) {
        setNeedsLocation(true);
        setError(data.message);
      } else if (data.needsBlogIndex) {
        setNeedsBlogIndex(true);
        setError(data.message);
      } else if (data.keywords && data.keywords.length > 0) {
        setRecommendedKeywords(data.keywords);
        setBlogIndexLevel(data.blogIndexLevel);
        setLocation(data.location || '');
      } else if (data.error) {
        setError(data.error);
      }
    } catch {
      setError('키워드 추천을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getBlogLevelBadge = () => {
    switch (blogIndexLevel) {
      case 'high':
        return <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs">상</span>;
      case 'medium':
        return <span className="px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 text-xs">중</span>;
      case 'low':
        return <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 text-xs">하</span>;
      default:
        return null;
    }
  };

  const getBlogLevelStrategy = () => {
    switch (blogIndexLevel) {
      case 'high':
        return '구/시 단위 경쟁 키워드로 노출을 노려보세요';
      case 'medium':
        return '동 단위 키워드로 안정적인 노출을 목표로 합니다';
      case 'low':
        return '동 + 세부시술 조합으로 틈새 키워드를 공략하세요';
      default:
        return '';
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">
          검색 키워드를 선택해주세요
        </h2>
        <p className="text-text-secondary">
          블로그 지수와 지역에 맞는 키워드를 추천해드립니다
        </p>
      </div>

      <div className="max-w-xl mx-auto space-y-6">
        {/* 로딩 상태 */}
        {loading && (
          <div className="text-center py-8">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600 mb-3" />
            <p className="text-sm text-slate-500">AI가 최적의 키워드를 분석 중입니다...</p>
          </div>
        )}

        {/* 설정 필요 안내 */}
        {(needsLocation || needsBlogIndex) && !loading && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
            <div className="flex items-start gap-3">
              <span className="text-xl">⚙️</span>
              <div>
                <p className="font-medium text-amber-800 mb-2">{error}</p>
                <p className="text-sm text-amber-700 mb-3">
                  {needsLocation && '키워드 추천을 위해 샵 위치 정보가 필요합니다.'}
                  {needsBlogIndex && '키워드 추천을 위해 블로그 지수 설정이 필요합니다.'}
                </p>
                <Link
                  href="/settings"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 text-white text-sm font-medium hover:bg-amber-700"
                >
                  설정으로 이동
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* AI 추천 키워드 */}
        {!loading && !needsLocation && !needsBlogIndex && recommendedKeywords.length > 0 && (
          <div className="space-y-4">
            {/* 지역/지수 정보 */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span>📍</span>
                <span>{location}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">블로그 지수:</span>
                {getBlogLevelBadge()}
              </div>
            </div>

            {/* 전략 안내 */}
            <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
              <p className="text-sm text-blue-700">
                💡 {getBlogLevelStrategy()}
              </p>
            </div>

            {/* 추천 키워드 목록 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">AI 추천 키워드</label>
              <div className="space-y-2">
                {recommendedKeywords.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => onChange(item.keyword)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      value === item.keyword
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 bg-white hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-medium ${value === item.keyword ? 'text-blue-700' : 'text-slate-800'}`}>
                        {item.keyword}
                      </span>
                      {value === item.keyword && (
                        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{item.reason}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* 다시 추천받기 */}
            <button
              onClick={fetchRecommendations}
              className="w-full py-2 text-sm text-slate-500 hover:text-slate-700"
            >
              🔄 다른 키워드 추천받기
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
            <span>직접 키워드 입력하기</span>
          </button>

          {showManualInput && (
            <div className="mt-3 space-y-2 animate-fade-in">
              <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="예: 천안눈썹문신, 강남피부관리"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
              />
              <p className="text-xs text-slate-400">
                추천 키워드 대신 원하는 키워드를 직접 입력할 수 있습니다
              </p>
            </div>
          )}
        </div>

        {/* 선택된 키워드 표시 */}
        {value && (
          <div className="text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-green-50 text-green-700 text-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>선택된 키워드: <strong>{value}</strong></span>
            </div>
          </div>
        )}

        {/* 에러 표시 (설정 필요 외) */}
        {error && !needsLocation && !needsBlogIndex && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-100">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
