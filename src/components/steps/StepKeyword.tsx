'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';

interface StepKeywordProps {
  value: string;
  onChange: (value: string) => void;
  businessCategory: string | null;
  topic: string | null;
}

// 업종별 세부 키워드 예시
const DETAIL_KEYWORDS: Record<string, string[]> = {
  'semi-permanent': ['눈썹문신', '여자눈썹문신', '남자눈썹문신', '반영구눈썹', '자연눈썹문신', '콤보눈썹', '아이라인문신', '입술문신', '헤어라인문신'],
  eyelash: ['속눈썹펌', '속눈썹연장', '래쉬리프트', '속눈썹펌추천', '자연속눈썹펌'],
  nail: ['네일아트', '젤네일', '손톱관리', '네일케어', '패디큐어'],
  skin: ['피부관리', '여드름관리', '모공관리', '피부관리실', '얼굴관리'],
  hair: ['헤어컷', '머리염색', '남자헤어', '여자헤어', '펌추천', '탈색'],
  waxing: ['왁싱', '브라질리언왁싱', '페이스왁싱', '바디왁싱'],
  scalp: ['두피문신', '두피관리', 'SMP', '탈모관리', '두피케어'],
  makeup: ['메이크업', '웨딩메이크업', '셀프메이크업'],
};

// 기본 세부 키워드
const DEFAULT_DETAILS = ['시술', '관리', '추천', '잘하는곳', '가격'];

// 모든 세부키워드 목록 (지역 분리용)
const ALL_DETAIL_KEYWORDS = [
  ...new Set(Object.values(DETAIL_KEYWORDS).flat().concat(DEFAULT_DETAILS))
];

// 키워드에서 지역과 세부키워드 분리
function splitRegionDetail(keyword: string): { region: string; detail: string } {
  // 세부키워드 목록에서 긴 것부터 매칭 시도
  const sorted = [...ALL_DETAIL_KEYWORDS].sort((a, b) => b.length - a.length);
  for (const d of sorted) {
    if (keyword.endsWith(d)) {
      const r = keyword.slice(0, keyword.length - d.length);
      if (r.length >= 2) return { region: r, detail: d };
    }
    if (keyword.includes(d)) {
      const idx = keyword.indexOf(d);
      const r = keyword.slice(0, idx);
      if (r.length >= 2) return { region: r, detail: keyword.slice(idx) };
    }
  }
  // 매칭 안 되면 앞 2글자를 지역으로
  if (keyword.length > 2) {
    return { region: keyword.slice(0, 2), detail: keyword.slice(2) };
  }
  return { region: keyword, detail: '' };
}

export default function StepKeyword({ value, onChange, businessCategory }: StepKeywordProps) {
  const [region, setRegion] = useState('');
  const [detail, setDetail] = useState('');
  const [pastKeywords, setPastKeywords] = useState<{ keyword: string; usedAt: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [keywordWarning, setKeywordWarning] = useState<string | null>(null);

  // 이전에 사용한 키워드 불러오기
  useEffect(() => {
    async function loadPastKeywords() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setLoading(false); return; }

        const { data } = await supabase
          .from('histories')
          .select('keyword, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50);

        if (data && data.length > 0) {
          // 키워드별 사용 횟수, 최근 사용일 집계
          const keywordMap = new Map<string, { count: number; lastUsed: string }>();
          for (const row of data) {
            if (!row.keyword) continue;
            const existing = keywordMap.get(row.keyword);
            if (existing) {
              existing.count += 1;
            } else {
              keywordMap.set(row.keyword, { count: 1, lastUsed: row.created_at });
            }
          }

          const sorted = Array.from(keywordMap.entries())
            .map(([keyword, info]) => ({
              keyword,
              usedAt: info.lastUsed,
              count: info.count,
            }))
            .sort((a, b) => new Date(b.usedAt).getTime() - new Date(a.usedAt).getTime());

          setPastKeywords(sorted);

          // 마지막으로 쓴 키워드에서 지역 추출
          if (sorted.length > 0 && !region) {
            const lastKeyword = sorted[0].keyword;
            const { region: extractedRegion } = splitRegionDetail(lastKeyword);
            if (extractedRegion) {
              setRegion(extractedRegion);
            }
          }
        }
      } catch (err) {
        console.error('Load past keywords error:', err);
      } finally {
        setLoading(false);
      }
    }

    loadPastKeywords();
  }, []);

  // 지역 + 세부키워드 조합
  useEffect(() => {
    if (region && detail) {
      const combined = `${region}${detail}`;
      onChange(combined);
      setKeywordWarning(null);
    }
  }, [region, detail]);

  // 이 업종에서 아직 안 쓴 세부키워드 제안
  const suggestedDetails = useMemo(() => {
    const details = DETAIL_KEYWORDS[businessCategory || ''] || DEFAULT_DETAILS;
    // 세부키워드별 마지막 사용일 매핑
    const usedDetailMap = new Map<string, string>();
    for (const pk of pastKeywords) {
      const { detail: d } = splitRegionDetail(pk.keyword);
      const key = d || pk.keyword;
      if (!usedDetailMap.has(key)) {
        usedDetailMap.set(key, pk.usedAt);
      }
    }

    const getDaysAgo = (dateStr: string) => {
      const diff = Date.now() - new Date(dateStr).getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      if (days === 0) return '오늘';
      if (days === 1) return '어제';
      return `${days}일전`;
    };

    return details.map(d => ({
      keyword: d,
      isUsed: usedDetailMap.has(d),
      daysAgo: usedDetailMap.has(d) ? getDaysAgo(usedDetailMap.get(d)!) : null,
    }));
  }, [businessCategory, pastKeywords]);

  // 키워드 유효성 검사
  const validateKeyword = (keyword: string): string | null => {
    if (!keyword) return null;
    const incompleteHangul = /[ㄱ-ㅎㅏ-ㅣ]/;
    if (incompleteHangul.test(keyword)) {
      return '키워드에 오타가 있는 것 같습니다. 확인해주세요.';
    }
    return null;
  };

  const handleDirectInput = (newValue: string) => {
    onChange(newValue);
    setKeywordWarning(validateKeyword(newValue));
  };

  // 날짜 포맷
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const month = d.getMonth() + 1;
    const day = d.getDate();
    return `${month}/${day}`;
  };

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-black text-black mb-2">
          검색 키워드를 입력해주세요
        </h2>
        <p className="text-gray-500">
          지역 + 세부키워드 조합으로 입력하면 노출에 유리합니다
        </p>
      </div>

      <div className="max-w-xl mx-auto space-y-6">
        {/* 지역 + 세부키워드 조합 입력 */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-bold text-black">키워드 조합</span>
            <span className="text-xs text-gray-400">지역 + 세부키워드</span>
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">지역</label>
              <input
                type="text"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                placeholder="예: 천안, 강남, 수원"
                className="w-full rounded-xl border-2 border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#3B5CFF]"
              />
            </div>
            <div className="flex items-end pb-0.5 text-gray-300 text-lg font-bold">+</div>
            <div className="flex-[1.5]">
              <label className="block text-xs text-gray-500 mb-1">세부키워드</label>
              <input
                type="text"
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                placeholder="예: 눈썹문신, 속눈썹펌"
                className="w-full rounded-xl border-2 border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#3B5CFF]"
              />
            </div>
          </div>

          {/* 세부키워드 빠른 선택 */}
          <div>
            <p className="text-xs text-gray-400 mb-2">세부키워드 선택</p>
            <div className="flex flex-wrap gap-2">
              {suggestedDetails.map(({ keyword: d, isUsed, daysAgo }) => (
                <button
                  key={d}
                  onClick={() => setDetail(d)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    detail === d
                      ? 'bg-[#3B5CFF] text-white'
                      : isUsed
                      ? 'bg-gray-100 text-gray-400 line-through'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {d}
                  {isUsed && detail !== d && ` (${daysAgo})`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 또는 직접 입력 */}
        <div className="flex items-center gap-3">
          <div className="flex-1 border-t border-gray-200" />
          <span className="text-xs text-gray-400">또는 직접 입력</span>
          <div className="flex-1 border-t border-gray-200" />
        </div>

        <div>
          <input
            type="text"
            value={value}
            onChange={(e) => handleDirectInput(e.target.value)}
            placeholder="예: 천안눈썹문신, 강남여자눈썹문신, 수원속눈썹펌"
            className={`w-full rounded-xl border-2 px-4 py-3 text-sm outline-none focus:border-[#3B5CFF] ${
              keywordWarning ? 'border-amber-400 bg-amber-50' : 'border-gray-200'
            }`}
          />
          {keywordWarning && (
            <p className="text-xs text-amber-600 mt-1">⚠️ {keywordWarning}</p>
          )}
        </div>

        {/* 선택된 키워드 표시 */}
        {value && !keywordWarning && (
          <div className="text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#3B5CFF] text-white font-bold text-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              선택된 키워드: <strong>{value}</strong>
            </div>
          </div>
        )}

        {/* 이전에 사용한 키워드 */}
        {!loading && pastKeywords.length > 0 && (
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-bold text-black">이전에 사용한 키워드</span>
            </div>

            {/* 새 키워드 제안 메시지 */}
            {pastKeywords.length > 0 && (
              <div className="mb-3 p-3 rounded-lg bg-[#3B5CFF]/5 border border-[#3B5CFF]/20">
                <p className="text-xs text-gray-600">
                  <strong className="text-[#3B5CFF]">"{pastKeywords[0].keyword}"</strong>을(를) {pastKeywords[0].count}번 사용했어요.
                  {' '}같은 키워드를 반복하면 네이버에서 저품질로 판단할 수 있으니, 오늘은 다른 키워드를 써보는 건 어떨까요?
                </p>
              </div>
            )}

            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {pastKeywords.slice(0, 8).map((pk, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    onChange(pk.keyword);
                    setKeywordWarning(null);
                    // 지역/세부 분리
                    const { region: r, detail: d } = splitRegionDetail(pk.keyword);
                    if (r) setRegion(r);
                    if (d) setDetail(d);
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-lg transition-all flex items-center justify-between ${
                    value === pk.keyword
                      ? 'bg-[#3B5CFF]/10 border border-[#3B5CFF]/30'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${value === pk.keyword ? 'text-[#3B5CFF]' : 'text-black'}`}>
                      {pk.keyword}
                    </span>
                    <span className="text-xs text-gray-400">{pk.count}회</span>
                  </div>
                  <span className="text-xs text-gray-400">{formatDate(pk.usedAt)}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div className="text-center py-4">
            <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-[#3B5CFF]" />
          </div>
        )}
      </div>
    </div>
  );
}
