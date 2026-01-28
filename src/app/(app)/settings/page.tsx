'use client';

import { useState, useEffect } from 'react';
import { getSettings, saveSettings, clearAllHistory, type AppSettings } from '@/lib/storage';
import { BUSINESS_CATEGORIES } from '@/data/constants';
import { createClient } from '@/lib/supabase/client';

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>({
    defaultBusinessCategory: null,
    keywordPresets: [],
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
        const s = await getSettings(user.id);
        setSettings(s);
      }
      setLoading(false);
    }
    load();
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2000);
  };

  const handleSave = async (updated: AppSettings) => {
    setSettings(updated);
    if (userId) {
      await saveSettings(userId, updated);
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
    handleSave({ ...settings, keywordPresets: [...settings.keywordPresets, trimmed] });
    setNewPreset('');
  };

  const handleRemovePreset = (keyword: string) => {
    handleSave({
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
        {/* 기본 업종 */}
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <label className="mb-2 block text-sm font-medium text-slate-900">기본 업종</label>
          <p className="mb-3 text-xs text-slate-500">글 작성 시 자동으로 선택됩니다</p>
          <select
            value={settings.defaultBusinessCategory || ''}
            onChange={(e) =>
              handleSave({ ...settings, defaultBusinessCategory: e.target.value || null })
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
