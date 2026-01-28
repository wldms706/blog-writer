'use client';

import { useState, useEffect } from 'react';
import { getSettings, saveSettings, clearAllHistory, getAllHistory, type AppSettings } from '@/lib/storage';
import { BUSINESS_CATEGORIES } from '@/data/constants';

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>({
    defaultBusinessCategory: null,
    keywordPresets: [],
  });
  const [newKeyword, setNewKeyword] = useState('');
  const [historyCount, setHistoryCount] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSettings(getSettings());
    setHistoryCount(getAllHistory().length);
  }, []);

  const handleSave = (updated: AppSettings) => {
    setSettings(updated);
    saveSettings(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const handleAddKeyword = () => {
    const trimmed = newKeyword.trim();
    if (!trimmed || settings.keywordPresets.includes(trimmed)) return;
    if (settings.keywordPresets.length >= 5) return;
    handleSave({ ...settings, keywordPresets: [...settings.keywordPresets, trimmed] });
    setNewKeyword('');
  };

  const handleRemoveKeyword = (keyword: string) => {
    handleSave({
      ...settings,
      keywordPresets: settings.keywordPresets.filter((k) => k !== keyword),
    });
  };

  const handleClearHistory = () => {
    clearAllHistory();
    setHistoryCount(0);
    setShowConfirm(false);
  };

  return (
    <div>
      <h2 className="mb-6 text-lg font-semibold text-slate-900">설정</h2>

      <div className="space-y-6">
        {/* 기본 업종 */}
        <div className="rounded-xl border border-slate-200 p-4">
          <label className="mb-1 block text-sm font-medium text-slate-900">기본 업종</label>
          <p className="mb-3 text-xs text-slate-500">글 작성 시 자동으로 선택되는 업종입니다</p>
          <select
            value={settings.defaultBusinessCategory || ''}
            onChange={(e) =>
              handleSave({
                ...settings,
                defaultBusinessCategory: e.target.value || null,
              })
            }
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">선택 안 함</option>
            {BUSINESS_CATEGORIES.map((biz) => (
              <option key={biz.id} value={biz.id}>
                {biz.icon} {biz.name}
              </option>
            ))}
          </select>
        </div>

        {/* 키워드 프리셋 */}
        <div className="rounded-xl border border-slate-200 p-4">
          <label className="mb-1 block text-sm font-medium text-slate-900">키워드 프리셋</label>
          <p className="mb-3 text-xs text-slate-500">
            자주 사용하는 키워드를 저장합니다 (최대 5개)
          </p>

          <div className="mb-3 flex gap-2">
            <input
              type="text"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddKeyword()}
              placeholder="키워드 입력"
              className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              disabled={settings.keywordPresets.length >= 5}
            />
            <button
              onClick={handleAddKeyword}
              disabled={settings.keywordPresets.length >= 5 || !newKeyword.trim()}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400"
            >
              추가
            </button>
          </div>

          {settings.keywordPresets.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {settings.keywordPresets.map((keyword) => (
                <span
                  key={keyword}
                  className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
                >
                  {keyword}
                  <button
                    onClick={() => handleRemoveKeyword(keyword)}
                    className="ml-0.5 rounded-full p-0.5 hover:bg-blue-100"
                  >
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400">저장된 키워드가 없습니다</p>
          )}
        </div>

        {/* 히스토리 삭제 */}
        <div className="rounded-xl border border-red-100 bg-red-50/50 p-4">
          <label className="mb-1 block text-sm font-medium text-slate-900">데이터 관리</label>
          <p className="mb-3 text-xs text-slate-500">
            저장된 히스토리 {historyCount}개를 모두 삭제합니다
          </p>

          {!showConfirm ? (
            <button
              onClick={() => setShowConfirm(true)}
              disabled={historyCount === 0}
              className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:text-slate-400 disabled:border-slate-200 disabled:hover:bg-white"
            >
              히스토리 전체 삭제
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-red-600">정말 삭제하시겠습니까?</span>
              <button
                onClick={handleClearHistory}
                className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
              >
                삭제
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200"
              >
                취소
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 저장 완료 토스트 */}
      {saved && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-lg">
          저장되었습니다
        </div>
      )}
    </div>
  );
}
