'use client';

import { useState, useEffect } from 'react';
import { getSettings, saveSettings, clearAllHistory, getProfile, saveProfile, type AppSettings, type UserProfile } from '@/lib/storage';
import { BUSINESS_CATEGORIES } from '@/data/constants';
import { createClient } from '@/lib/supabase/client';

export default function SettingsPage() {
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
  const [newPreset, setNewPreset] = useState('');
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

  const handleAddPreset = () => {
    const trimmed = newPreset.trim();
    if (!trimmed || settings.keywordPresets.includes(trimmed)) return;
    if (settings.keywordPresets.length >= 5) {
      showToast('최대 5개까지 저장 가능합니다');
      return;
    }
    handleSaveSettings({ ...settings, keywordPresets: [...settings.keywordPresets, trimmed] });
    setNewPreset('');
  };

  const handleRemovePreset = (keyword: string) => {
    handleSaveSettings({
      ...settings,
      keywordPresets: settings.keywordPresets.filter((k) => k !== keyword),
    });
  };

  const handleClearHistory = async () => {
    if (userId) {
      await clearAllHistory(userId);
    }
    setShowClearConfirm(false);
    showToast('히스토리가 삭제되었습니다');
  };

  const getBlogLevelText = (level: string | null) => {
    switch (level) {
      case 'high': return '상 (경쟁 키워드 도전 가능)';
      case 'medium': return '중 (동 단위 키워드 추천)';
      case 'low': return '하 (세부 키워드 집중)';
      default: return '미측정';
    }
  };

  const getBlogLevelColor = (level: string | null) => {
    switch (level) {
      case 'high': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-orange-600 bg-orange-50';
      default: return 'text-slate-500 bg-slate-50';
    }
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
            <label className="mb-2 block text-xs font-medium text-slate-700">블로그 지수 선택</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleSaveProfile({ blogIndexLevel: 'high', blogIndexCheckedAt: new Date().toISOString() })}
                className={`rounded-lg border-2 px-3 py-2 text-xs font-medium transition-all ${
                  profile.blogIndexLevel === 'high'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-green-300'
                }`}
              >
                상 (1000+)
              </button>
              <button
                onClick={() => handleSaveProfile({ blogIndexLevel: 'medium', blogIndexCheckedAt: new Date().toISOString() })}
                className={`rounded-lg border-2 px-3 py-2 text-xs font-medium transition-all ${
                  profile.blogIndexLevel === 'medium'
                    ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-yellow-300'
                }`}
              >
                중 (100~999)
              </button>
              <button
                onClick={() => handleSaveProfile({ blogIndexLevel: 'low', blogIndexCheckedAt: new Date().toISOString() })}
                className={`rounded-lg border-2 px-3 py-2 text-xs font-medium transition-all ${
                  profile.blogIndexLevel === 'low'
                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-orange-300'
                }`}
              >
                하 (0~99)
              </button>
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
                {profile.blogIndexLevel === 'high' && '넓은 지역 키워드(구/시 단위)로 경쟁해보세요!'}
                {profile.blogIndexLevel === 'medium' && '동 단위 키워드로 안정적인 노출을 노려보세요.'}
                {profile.blogIndexLevel === 'low' && '세부 시술 + 동 조합 키워드로 틈새를 공략하세요.'}
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

        {/* 키워드 프리셋 */}
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <label className="mb-2 block text-sm font-medium text-slate-900">키워드 프리셋</label>
          <p className="mb-3 text-xs text-slate-500">자주 사용하는 키워드를 저장하세요 (최대 5개)</p>

          <div className="mb-3 flex gap-2">
            <input
              type="text"
              value={newPreset}
              onChange={(e) => setNewPreset(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddPreset()}
              placeholder="키워드 입력"
              className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
            <button
              onClick={handleAddPreset}
              className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              추가
            </button>
          </div>

          {settings.keywordPresets.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {settings.keywordPresets.map((kw) => (
                <span
                  key={kw}
                  className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs text-slate-700"
                >
                  {kw}
                  <button
                    onClick={() => handleRemovePreset(kw)}
                    className="ml-0.5 text-slate-400 hover:text-red-500"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400">저장된 키워드가 없습니다</p>
          )}
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
