'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [error, setError] = useState('');
  const [socialLoading, setSocialLoading] = useState(false);
  const supabase = createClient();

  const handleGoogleLogin = async () => {
    setSocialLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError('Google 로그인에 실패했습니다.');
      setSocialLoading(false);
    }
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
      {/* 간편 로그인 */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-slate-900">로그인</h2>
        <div className="space-y-2">
          {/* 카카오 로그인 */}
          <button
            type="button"
            onClick={handleKakaoLogin}
            disabled={socialLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#FEE500] py-2.5 text-sm font-medium text-[#000000]/85 hover:bg-[#FDD835] disabled:opacity-50"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path fillRule="evenodd" clipRule="evenodd" d="M9 0.5C4.029 0.5 0 3.591 0 7.415c0 2.487 1.679 4.665 4.196 5.876-.136.479-.876 3.078-.907 3.291 0 0-.018.152.08.21.098.058.214.013.214.013.282-.04 3.269-2.14 3.783-2.5.538.076 1.093.116 1.634.116 4.971 0 9-3.091 9-6.915S13.971 0.5 9 0.5" fill="#000000"/>
            </svg>
            {socialLoading ? '로그인 중...' : '카카오로 시작하기'}
          </button>

          {/* Google 로그인 */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={socialLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
              <path d="M9.003 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.96v2.332C2.44 15.983 5.485 18 9.003 18z" fill="#34A853"/>
              <path d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.71 0-.593.102-1.17.282-1.71V4.96H.957C.347 6.175 0 7.55 0 9.002c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.428 0 9.002 0 5.485 0 2.44 2.017.96 4.958L3.967 7.29c.708-2.127 2.692-3.71 5.036-3.71z" fill="#EA4335"/>
            </svg>
            {socialLoading ? '로그인 중...' : 'Google로 시작하기'}
          </button>
        </div>

        {error && (
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>
        )}
      </div>

      <p className="text-center text-xs text-slate-500">
        계정이 없으신가요?{' '}
        <Link href="/signup" className="font-medium text-blue-600 hover:underline">
          회원가입
        </Link>
      </p>
    </div>
  );
}
