'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSettings, saveSettings, clearAllHistory, getProfile, saveProfile, type AppSettings, type UserProfile, type BlogIndexLevel } from '@/lib/storage';
import { BUSINESS_CATEGORIES } from '@/data/constants';
import { createClient } from '@/lib/supabase/client';

interface Subscription {
  plan_id: string;
  plan_name: string;
  status: string;
  price: number;
  next_billing_at: string | null;
  card_company: string | null;
  card_number: string | null;
}

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
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
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

        // 구독 정보 가져오기
        const { data: subData } = await supabase
          .from('subscriptions')
          .select('plan_id, plan_name, status, price, next_billing_at, card_company, card_number')
          .eq('user_id', user.id)
          .single();

        if (subData) {
          setSubscription(subData);
        }
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
      const success = await saveProfile(userId, updated);
      if (success) {
        showToast('저장되었습니다');
      } else {
        showToast('저장에 실패했습니다. 다시 시도해주세요.');
      }
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input
              type="text"
              value={profile.locationCity}
              onChange={(e) => setProfile({ ...profile, locationCity: e.target.value })}
              onBlur={() => handleSaveProfile({ locationCity: profile.locationCity })}
              placeholder="시/도 (예: 서울시)"
              className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
            />
            <input
              type="text"
              value={profile.locationDistrict}
              onChange={(e) => setProfile({ ...profile, locationDistrict: e.target.value })}
              onBlur={() => handleSaveProfile({ locationDistrict: profile.locationDistrict })}
              placeholder="구 (예: 강남구)"
              className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
            />
            <input
              type="text"
              value={profile.locationNeighborhood}
              onChange={(e) => setProfile({ ...profile, locationNeighborhood: e.target.value })}
              onBlur={() => handleSaveProfile({ locationNeighborhood: profile.locationNeighborhood })}
              placeholder="동 (선택)"
              className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
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
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
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

        {/* 구독 관리 */}
        <div className="rounded-xl border border-green-100 bg-white p-4">
          <label className="mb-2 block text-sm font-medium text-slate-900">구독 관리</label>

          {subscription && subscription.status === 'active' ? (
            <div className="space-y-3">
              <div className="rounded-lg bg-green-50 p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-green-600">현재 플랜</span>
                    <p className="text-sm font-semibold text-green-800">{subscription.plan_name}</p>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                    구독 중
                  </span>
                </div>
                <div className="mt-2 text-xs text-green-700">
                  <p>결제 금액: {subscription.price.toLocaleString()}원/월</p>
                  {subscription.next_billing_at && (
                    <p>다음 결제일: {new Date(subscription.next_billing_at).toLocaleDateString('ko-KR')}</p>
                  )}
                  {subscription.card_company && subscription.card_number && (
                    <p>결제 수단: {subscription.card_company} {subscription.card_number}</p>
                  )}
                </div>
              </div>

              {!showCancelConfirm ? (
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  className="text-xs text-slate-500 hover:text-red-600 underline"
                >
                  구독 취소하기
                </button>
              ) : (
                <div className="rounded-lg bg-red-50 p-3">
                  <p className="mb-2 text-xs text-red-700">
                    구독을 취소하시겠습니까? 다음 결제일부터 서비스가 중단됩니다.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        const supabase = createClient();
                        await supabase
                          .from('subscriptions')
                          .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
                          .eq('user_id', userId);
                        setSubscription({ ...subscription, status: 'cancelled' });
                        setShowCancelConfirm(false);
                        showToast('구독이 취소되었습니다');
                      }}
                      className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
                    >
                      취소 확인
                    </button>
                    <button
                      onClick={() => setShowCancelConfirm(false)}
                      className="rounded-lg bg-white px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50"
                    >
                      돌아가기
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : subscription && subscription.status === 'cancelled' ? (
            <div className="space-y-3">
              <div className="rounded-lg bg-yellow-50 p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-yellow-600">이전 플랜</span>
                    <p className="text-sm font-semibold text-yellow-800">{subscription.plan_name}</p>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-700">
                    취소됨
                  </span>
                </div>
                {subscription.next_billing_at && (
                  <p className="mt-2 text-xs text-yellow-700">
                    {new Date(subscription.next_billing_at).toLocaleDateString('ko-KR')}까지 이용 가능
                  </p>
                )}
              </div>
              <Link
                href="/subscribe"
                className="block w-full rounded-lg bg-blue-600 py-2.5 text-center text-xs font-medium text-white hover:bg-blue-700"
              >
                다시 구독하기
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-sm text-slate-600">현재 무료 플랜을 사용 중입니다.</p>
                <p className="mt-1 text-xs text-slate-500">프로 플랜으로 업그레이드하면 무제한으로 글을 생성할 수 있습니다.</p>
              </div>
              <Link
                href="/subscribe"
                className="block w-full rounded-lg bg-blue-600 py-2.5 text-center text-xs font-medium text-white hover:bg-blue-700"
              >
                프로 플랜 시작하기
              </Link>
            </div>
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
