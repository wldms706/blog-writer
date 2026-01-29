'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSettings, saveSettings, clearAllHistory, getProfile, saveProfile, type AppSettings, type UserProfile, type BlogIndexLevel } from '@/lib/storage';
import { BUSINESS_CATEGORIES } from '@/data/constants';
import { createClient } from '@/lib/supabase/client';

export default function SettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<AppSettings>({
    defaultBusinessCategory: null,
    keywordPresets: [],
  });
  const [profile, setProfile] = useState<UserProfile>({
    locationCity: '',
    locationDistrict: '',
    locationNeighborhood: '',
    blogUrl: '',
    blogIndexLevel: null,
    blogIndexCheckedAt: null,
  });
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const [s, p] = await Promise.all([
          getSettings(user.id),
          getProfile(user.id),
        ]);
        setSettings(s);
        setProfile(p);
      }
      setLoading(false);
    }
    load();
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2000);
  };

  const handleSaveSettings = async (updated: AppSettings) => {
    setSettings(updated);
    if (userId) {
      await saveSettings(userId, updated);
      showToast('저장되었습니다');
    }
  };

  const handleSaveProfile = async (updated: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...updated }));
    if (userId) {
      await saveProfile(userId, updated);
      showToast('저장되었습니다');
    }
  };

  const handleClearHistory = async () => {
    if (userId) {
      await clearAllHistory(userId);
    }
    setShowClearConfirm(false);
    showToast('히스토리가 삭제되었습니다');
  };

  // 블덱스 지수 체계 (4그룹: 최적, 준최 상위(5~7), 준최 하위(1~4), 일반)
  const BLOG_INDEX_OPTIONS: { value: NonNullable<BlogIndexLevel>; label: string; group: string; color: string }[] = [
    { value: 'optimal3', label: '최적 3', group: 'optimal', color: 'green' },
    { value: 'optimal2', label: '최적 2', group: 'optimal', color: 'green' },
    { value: 'optimal1', label: '최적 1', group: 'optimal', color: 'green' },
    { value: 'sub7', label: '준최 7', group: 'sub-high', color: 'blue' },
    { value: 'sub6', label: '준최 6', group: 'sub-high', color: 'blue' },
    { value: 'sub5', label: '준최 5', group: 'sub-high', color: 'blue' },
    { value: 'sub4', label: '준최 4', group: 'sub-low', color: 'yellow' },
    { value: 'sub3', label: '준최 3', group: 'sub-low', color: 'yellow' },
    { value: 'sub2', label: '준최 2', group: 'sub-low', color: 'yellow' },
    { value: 'sub1', label: '준최 1', group: 'sub-low', color: 'yellow' },
    { value: 'sub0', label: '일반', group: 'general', color: 'gray' },
  ];

  const getBlogLevelText = (level: string | null) => {
    const option = BLOG_INDEX_OPTIONS.find(o => o.value === level);
    if (!option) return '미측정';

    if (option.group === 'optimal') return `${option.label} (경쟁 키워드 도전 가능)`;
    if (option.group === 'sub-high') return `${option.label} (동 단위 키워드)`;
    if (option.group === 'sub-low') return `${option.label} (세부 키워드 조합)`;
    return `${option.label} (틈새 키워드 집중)`;
  };

  const getBlogLevelColor = (level: string | null) => {
    const option = BLOG_INDEX_OPTIONS.find(o => o.value === level);
    if (!option) return 'text-slate-500 bg-slate-50';

    switch (option.color) {
      case 'green': return 'text-green-600 bg-green-50';
      case 'blue': return 'text-blue-600 bg-blue-50';
      case 'yellow': return 'text-yellow-600 bg-yellow-50';
      case 'gray': return 'text-slate-600 bg-slate-50';
      default: return 'text-slate-500 bg-slate-50';
    }
  };

  const getBlogLevelStrategy = (level: string | null) => {
    const option = BLOG_INDEX_OPTIONS.find(o => o.value === level);
    if (!option) return '';

    if (option.group === 'optimal') return '넓은 지역 키워드(구/시 단위)로 경쟁해보세요!';
    if (option.group === 'sub-high') return '동 단위 키워드로 안정적인 노출을 노려보세요.';
    if (option.group === 'sub-low') return '동 + 세부 키워드 조합(예: 역삼동여자눈썹문신)으로 공략하세요.';
    return '초세부 틈새 키워드(예: 신사동망한눈썹문신)로 집중 공략하세요.';
  };

  if (loading) {
    return (
      <div className="py-16 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-slate-900">설정</h2>

      <div className="space-y-4">
        {/* 샵 위치 */}
        <div className="rounded-xl border border-blue-100 bg-white p-4">
          <label className="mb-2 block text-sm font-medium text-slate-900">샵 위치</label>
          <p className="mb-3 text-xs text-slate-500">키워드 추천에 사용됩니다 (예: 서울시 강남구 신사동)</p>
          <div className="grid grid-cols-3 gap-2">
            <input
              type="text"
              value={profile.locationCity}
              onChange={(e) => setProfile({ ...profile, locationCity: e.target.value })}
              onBlur={() => handleSaveProfile({ locationCity: profile.locationCity })}
              placeholder="시/도"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
            <input
              type="text"
              value={profile.locationDistrict}
              onChange={(e) => setProfile({ ...profile, locationDistrict: e.target.value })}
              onBlur={() => handleSaveProfile({ locationDistrict: profile.locationDistrict })}
              placeholder="구"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
            <input
              type="text"
              value={profile.locationNeighborhood}
              onChange={(e) => setProfile({ ...profile, locationNeighborhood: e.target.value })}
              onBlur={() => handleSaveProfile({ locationNeighborhood: profile.locationNeighborhood })}
              placeholder="동"
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          </div>
          {profile.locationCity && profile.locationNeighborhood && (
            <p className="mt-2 text-xs text-blue-600">
              설정된 위치: {profile.locationCity} {profile.locationDistrict} {profile.locationNeighborhood}
            </p>
          )}
        </div>

        {/* 블로그 정보 */}
        <div className="rounded-xl border border-purple-100 bg-white p-4">
          <label className="mb-2 block text-sm font-medium text-slate-900">내 블로그</label>
          <p className="mb-3 text-xs text-slate-500">블로그 지수에 따라 최적의 키워드를 추천해드립니다</p>

          <div className="mb-3">
            <input
              type="url"
              value={profile.blogUrl}
              onChange={(e) => setProfile({ ...profile, blogUrl: e.target.value })}
              onBlur={() => handleSaveProfile({ blogUrl: profile.blogUrl })}
              placeholder="https://blog.naver.com/your-blog-id"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          </div>

          {/* 블덱스 링크 */}
          <div className="mb-3 rounded-lg bg-purple-50 p-3">
            <p className="mb-2 text-xs text-purple-700">블로그 지수를 모르시나요?</p>
            <a
              href="https://blogdex.space"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-purple-700"
            >
              블덱스에서 내 블로그 지수 확인하기
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>

          {/* 블로그 지수 수동 선택 */}
          <div className="mb-3">
            <label className="mb-2 block text-xs font-medium text-slate-700">블로그 지수 선택 (블덱스 기준)</label>

            {/* 최적 그룹 */}
            <div className="mb-2">
              <p className="mb-1 text-[10px] text-green-600 font-medium">최적화</p>
              <div className="grid grid-cols-3 gap-1.5">
                {BLOG_INDEX_OPTIONS.filter(o => o.group === 'optimal').map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSaveProfile({ blogIndexLevel: option.value, blogIndexCheckedAt: new Date().toISOString() })}
                    className={`rounded-lg border-2 px-2 py-1.5 text-xs font-medium transition-all ${
                      profile.blogIndexLevel === option.value
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-green-300'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 준최 상위 그룹 (5~7) */}
            <div className="mb-2">
              <p className="mb-1 text-[10px] text-blue-600 font-medium">준최적화 5~7 (동 단위 키워드)</p>
              <div className="grid grid-cols-3 gap-1.5">
                {BLOG_INDEX_OPTIONS.filter(o => o.group === 'sub-high').map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSaveProfile({ blogIndexLevel: option.value, blogIndexCheckedAt: new Date().toISOString() })}
                    className={`rounded-lg border-2 px-2 py-1.5 text-xs font-medium transition-all ${
                      profile.blogIndexLevel === option.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-blue-300'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 준최 하위 그룹 (1~4) */}
            <div className="mb-2">
              <p className="mb-1 text-[10px] text-yellow-600 font-medium">준최적화 1~4 (동+세부 조합)</p>
              <div className="grid grid-cols-4 gap-1.5">
                {BLOG_INDEX_OPTIONS.filter(o => o.group === 'sub-low').map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSaveProfile({ blogIndexLevel: option.value, blogIndexCheckedAt: new Date().toISOString() })}
                    className={`rounded-lg border-2 px-2 py-1.5 text-xs font-medium transition-all ${
                      profile.blogIndexLevel === option.value
                        ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-yellow-300'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 일반 (구 준최0) */}
            <div>
              <p className="mb-1 text-[10px] text-slate-600 font-medium">일반 (틈새 키워드)</p>
              <div className="grid grid-cols-1 gap-1.5">
                {BLOG_INDEX_OPTIONS.filter(o => o.group === 'general').map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSaveProfile({ blogIndexLevel: option.value, blogIndexCheckedAt: new Date().toISOString() })}
                    className={`rounded-lg border-2 px-2 py-1.5 text-xs font-medium transition-all ${
                      profile.blogIndexLevel === option.value
                        ? 'border-slate-500 bg-slate-100 text-slate-700'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 블로그 지수 결과 */}
          {profile.blogIndexLevel && (
            <div className={`rounded-lg p-3 ${getBlogLevelColor(profile.blogIndexLevel)}`}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium">선택된 지수: </span>
                  <span className="text-sm font-semibold">{getBlogLevelText(profile.blogIndexLevel)}</span>
                </div>
                {profile.blogIndexCheckedAt && (
                  <span className="text-[10px] opacity-70">
                    {new Date(profile.blogIndexCheckedAt).toLocaleDateString('ko-KR')} 설정
                  </span>
                )}
              </div>
              <p className="mt-1 text-[11px] opacity-80">
                {getBlogLevelStrategy(profile.blogIndexLevel)}
              </p>
            </div>
          )}
        </div>

        {/* 기본 업종 */}
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <label className="mb-2 block text-sm font-medium text-slate-900">기본 업종</label>
          <p className="mb-3 text-xs text-slate-500">글 작성 시 자동으로 선택됩니다</p>
          <select
            value={settings.defaultBusinessCategory || ''}
            onChange={(e) =>
              handleSaveSettings({ ...settings, defaultBusinessCategory: e.target.value || null })
            }
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
          >
            <option value="">선택 안 함</option>
            {BUSINESS_CATEGORIES.map((b) => (
              <option key={b.id} value={b.id}>
                {b.icon} {b.name}
              </option>
            ))}
          </select>
        </div>

        {/* 히스토리 삭제 */}
        <div className="rounded-xl border border-red-100 bg-white p-4">
          <label className="mb-2 block text-sm font-medium text-slate-900">데이터 관리</label>
          {!showClearConfirm ? (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
            >
              히스토리 전체 삭제
            </button>
          ) : (
            <div className="rounded-lg bg-red-50 p-3">
              <p className="mb-2 text-xs text-red-700">정말 모든 히스토리를 삭제하시겠습니까?</p>
              <div className="flex gap-2">
                <button
                  onClick={handleClearHistory}
                  className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
                >
                  삭제
                </button>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="rounded-lg bg-white px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50"
                >
                  취소
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 저장하고 글쓰기 버튼 */}
        <button
          onClick={() => router.push('/')}
          className="w-full rounded-xl bg-blue-600 py-3 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          저장하고 글쓰기
        </button>
      </div>

      {/* 토스트 */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
