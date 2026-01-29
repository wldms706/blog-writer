'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push('/');
    router.refresh();
  };

  const handleKakaoLogin = async () => {
    setSocialLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError('카카오 로그인에 실패했습니다.');
      setSocialLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* 카카오 로그인 */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-slate-900">간편 가입</h2>
        <button
          type="button"
          onClick={handleKakaoLogin}
          disabled={socialLoading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#FEE500] py-2.5 text-sm font-medium text-[#191919] hover:bg-[#FDD835] disabled:opacity-50"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M9 0.5C4.02944 0.5 0 3.69064 0 7.62054C0 10.0519 1.55853 12.1945 3.93188 13.4593L2.93037 17.0321C2.84768 17.3435 3.20636 17.5912 3.47951 17.4089L7.87338 14.5055C8.24054 14.5509 8.61621 14.5747 9 14.5747C13.9706 14.5747 18 11.3841 18 7.45415C18 3.52421 13.9706 0.5 9 0.5Z"
              fill="#191919"
            />
          </svg>
          {socialLoading ? '로그인 중...' : '카카오로 시작하기'}
        </button>
      </div>

      {/* 구분선 */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-xs text-slate-400">또는</span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      {/* 이메일 회원가입 */}
      <form onSubmit={handleSignup}>
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-slate-900">이메일 회원가입</h2>

          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">이메일</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="email@example.com"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">비밀번호</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="6자 이상"
              />
            </div>
          </div>

          {error && (
            <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full rounded-xl bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? '가입 중...' : '회원가입'}
          </button>

          <p className="mt-3 text-center text-[11px] text-slate-400">
            가입 시 무료 플랜(하루 3회 생성)이 적용됩니다
          </p>
        </div>
      </form>

      <p className="text-center text-xs text-slate-500">
        이미 계정이 있으신가요?{' '}
        <Link href="/login" className="font-medium text-blue-600 hover:underline">
          로그인
        </Link>
      </p>
    </div>
  );
}
