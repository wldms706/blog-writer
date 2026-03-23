'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function AuthRedirect() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    // 즉시 세션 체크 — 로그인 상태면 바로 /write로
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace('/write');
      }
    });

    // OAuth 콜백으로 돌아왔을 때 (hash fragment 토큰 감지)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          router.replace('/write');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [router]);

  return null;
}
