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
  topic: string | null;
}

export default function StepKeyword({ value, onChange, businessCategory, topic }: StepKeywordProps) {
  const [recommendedKeywords, setRecommendedKeywords] = useState<RecommendedKeyword[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsLocation, setNeedsLocation] = useState(false);
  const [needsBlogIndex, setNeedsBlogIndex] = useState(false);
  const [blogIndexLevel, setBlogIndexLevel] = useState<string | null>(null);
  const [location, setLocation] = useState<string>('');
  const [keywordWarning, setKeywordWarning] = useState<string | null>(null);

  // 키워드 유효성 검사
  const validateKeyword = (keyword: string): string | null => {
    if (!keyword) return null;

    // 한글 자모 분리 체크 (ㄱ-ㅎ, ㅏ-ㅣ 단독 사용)
    const incompleteHangul = /[ㄱ-ㅎㅏ-ㅣ]/;
    if (incompleteHangul.test(keyword)) {
      return '키워드에 오타가 있는 것 같습니다. 올바른 키워드인지 확인해주세요.';
    }

    // 특수문자 체크 (일부 허용: -, _)
    const invalidChars = /[!@#$%^&*()+=\[\]{};':"\\|,.<>\/?]/;
    if (invalidChars.test(keyword)) {
      return '키워드에 특수문자가 포함되어 있습니다. 검색어로 사용하기 어려울 수 있습니다.';
    }

    return null;
  };

  const handleKeywordChange = (newValue: string) => {
    onChange(newValue);
    const warning = validateKeyword(newValue);
    setKeywordWarning(warning);
  };

  useEffect(() => {
    if (businessCategory) {
      fetchRecommendations();
    }
  }, [businessCategory, topic]);

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
        body: JSON.stringify({ businessCategory, topic }),
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

  // 블덱스 지수를 전략 그룹으로 매핑
  const getStrategyGroup = (level: string | null): 'optimal' | 'sub-high' | 'sub-low' | 'general' | null => {
    if (!level) return null;
    if (['optimal1', 'optimal2', 'optimal3'].includes(level)) return 'optimal';
    if (['sub5', 'sub6', 'sub7'].includes(level)) return 'sub-high';
    if (['sub1', 'sub2', 'sub3', 'sub4'].includes(level)) return 'sub-low';
    return 'general'; // sub0 = 일반
  };

  const getBlogLevelBadge = () => {
    if (!blogIndexLevel) return null;

    // 블덱스 레벨 표시 (예: 최적3, 준최5, 일반)
    let label: string;
    if (blogIndexLevel === 'sub0') {
      label = '일반';
    } else if (blogIndexLevel.startsWith('optimal')) {
      label = `최적${blogIndexLevel.replace('optimal', '')}`;
    } else {
      label = `준최${blogIndexLevel.replace('sub', '')}`;
    }

    const group = getStrategyGroup(blogIndexLevel);
    const colorClass = group === 'optimal'
      ? 'bg-green-100 text-green-700'
      : group === 'sub-high'
      ? 'bg-[#3B5CFF]/10 text-[#3B5CFF]'
      : group === 'sub-low'
      ? 'bg-yellow-100 text-yellow-700'
      : 'bg-gray-100 text-gray-700';

    return <span className={`px-2 py-0.5 rounded-full text-xs ${colorClass}`}>{label}</span>;
  };

  const getBlogLevelStrategy = () => {
    const group = getStrategyGroup(blogIndexLevel);
    switch (group) {
      case 'optimal':
        return '구/시 단위 경쟁 키워드로 노출을 노려보세요';
      case 'sub-high':
        return '동 단위 키워드로 안정적인 노출을 목표로 합니다';
      case 'sub-low':
        return '동 + 세부 키워드 조합 (예: 역삼동여자눈썹문신)';
      case 'general':
        return '초세부 틈새 키워드로 집중 공략하세요 (예: 망한눈썹문신)';
      default:
        return '';
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-black text-black mb-2">
          검색 키워드를 선택해주세요
        </h2>
        <p className="text-gray-500">
          블로그 지수와 지역에 맞는 키워드를 추천해드립니다
        </p>
      </div>

      <div className="max-w-xl mx-auto space-y-6">
        {/* 직접 입력 (항상 최상단에 노출) */}
        <div className="space-y-2">
          <label className="block text-sm font-bold text-black">키워드 직접 입력</label>
          <input
            type="text"
            value={value}
            onChange={(e) => handleKeywordChange(e.target.value)}
            placeholder="예: 남자 헤어컷, 천안눈썹문신, 강남피부관리"
            className={`w-full rounded-xl border-2 px-4 py-3 text-sm outline-none focus:border-[#3B5CFF] ${
              keywordWarning ? 'border-amber-400 bg-amber-50' : 'border-gray-200 focus:bg-white'
            }`}
          />
          {keywordWarning ? (
            <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3">
              <span className="text-amber-500">⚠️</span>
              <p className="text-xs text-amber-700">{keywordWarning}</p>
            </div>
          ) : (
            <p className="text-xs text-gray-400">
              원하는 주제를 직접 입력하세요. 아래 AI 추천 키워드를 선택해도 됩니다.
            </p>
          )}
        </div>

        {/* 선택된 키워드 표시 */}
        {value && (
          <div className="text-center animate-fade-in">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm ${
              keywordWarning
                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                : 'bg-[#3B5CFF] text-white font-bold'
            }`}>
              {keywordWarning ? (
                <span>⚠️</span>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              <span>선택된 키워드: <strong>{value}</strong></span>
            </div>
          </div>
        )}

        {/* 구분선 */}
        <div className="flex items-center gap-3">
          <div className="flex-1 border-t border-gray-200" />
          <span className="text-xs text-gray-400">또는 AI 추천 키워드에서 선택</span>
          <div className="flex-1 border-t border-gray-200" />
        </div>

        {/* 로딩 상태 */}
        {loading && (
          <div className="text-center py-8">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-[#3B5CFF] mb-3" />
            <p className="text-sm text-gray-500">AI가 최적의 키워드를 분석 중입니다...</p>
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 rounded-lg bg-gray-50">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>📍</span>
                <span className="break-keep">{location}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">블로그 지수:</span>
                {getBlogLevelBadge()}
              </div>
            </div>

            {/* 전략 안내 */}
            <div className="p-3 rounded-lg bg-[#3B5CFF]/5 border border-[#3B5CFF]/20">
              <p className="text-sm text-gray-600">
                💡 {getBlogLevelStrategy()}
              </p>
            </div>

            {/* 추천 키워드 목록 */}
            <div className="space-y-2">
              <div className="space-y-2">
                {recommendedKeywords.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => { onChange(item.keyword); setKeywordWarning(null); }}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      value === item.keyword
                        ? 'border-[#3B5CFF] bg-[#3B5CFF]/5'
                        : 'border-gray-200 bg-white hover:border-[#3B5CFF]/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-medium ${value === item.keyword ? 'text-[#3B5CFF]' : 'text-black'}`}>
                        {item.keyword}
                      </span>
                      {value === item.keyword && (
                        <svg className="w-5 h-5 text-[#3B5CFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{item.reason}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* 다시 추천받기 */}
            <button
              onClick={fetchRecommendations}
              className="w-full py-2 text-sm text-gray-500 hover:text-gray-700"
            >
              🔄 다른 키워드 추천받기
            </button>
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
