'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function OnboardingGuard() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (pathname === '/onboarding') return;

    async function check() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', user.id)
          .single();

        // DB 에러(컬럼 없음 등)이면 온보딩 스킵
        if (error) return;

        if (!profile?.name) {
          router.push('/onboarding');
        }
      } catch {
        // 에러 시 온보딩 스킵 (메인 화면 유지)
      }
    }
    check();
  }, [pathname, router]);

  return null;
}
