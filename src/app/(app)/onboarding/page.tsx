'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { saveProfile } from '@/lib/storage';

export default function OnboardingPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [marketingAgreed, setMarketingAgreed] = useState(false);
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
      phone: phone.replace(/\D/g, ''),
      marketingAgreed,
    });

    // 환영 문자 (수신동의한 경우에만 발송된다. 실패해도 가입 흐름은 막지 않는다)
    fetch('/api/notify/welcome', { method: 'POST' }).catch(() => {});

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

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              휴대폰 번호
            </label>
            <input
              type="tel"
              inputMode="numeric"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="010-1234-5678 (선택)"
              className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#3B5CFF]"
            />
            <p className="mt-1.5 text-xs text-gray-400">
              결제 실패나 이용권 만료 같은 중요 안내를 문자로 보내드려요
            </p>

            <label className="mt-3 flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={marketingAgreed}
                onChange={(e) => setMarketingAgreed(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-[#3B5CFF]"
              />
              <span className="text-xs text-gray-500">
                (선택) 글쓰기 리마인드, 혜택 안내 문자를 받을게요
              </span>
            </label>
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
