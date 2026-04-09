'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { saveProfile } from '@/lib/storage';

export default function OnboardingPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function checkUser() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUserId(user.id);

      const { data: profile } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', user.id)
        .single();

      if (profile?.name) {
        router.push('/write');
      }
    }
    checkUser();
  }, [router]);

  const handleSubmit = async () => {
    if (!name.trim() || !userId) return;
    setSaving(true);
    await saveProfile(userId, {
      name: name.trim(),
      businessName: businessName.trim(),
    });
    setSaving(false);
    router.push('/settings');
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#3B5CFF]/10 flex items-center justify-center">
            <span className="text-2xl">👋</span>
          </div>
          <h1 className="text-2xl font-black text-black">환영합니다!</h1>
          <p className="mt-2 text-sm text-gray-500">
            이름을 입력하면 매장 정보를 설정할 수 있어요
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              이름 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="이름을 입력해주세요"
              className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#3B5CFF]"
              autoFocus
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              상호명
            </label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="매장/업체명 (선택)"
              className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#3B5CFF]"
            />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!name.trim() || saving}
          className="w-full rounded-full bg-[#3B5CFF] py-3 text-sm font-bold text-white hover:bg-[#2A45E0] disabled:opacity-50 transition-colors"
        >
          {saving ? '저장 중...' : '시작하기'}
        </button>

        <p className="text-center text-xs text-gray-400">
          최초 3회 무료 체험이 가능합니다
        </p>
      </div>
    </div>
  );
}
