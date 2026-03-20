'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Supabase를 동적으로 로드해서 초기 번들 크기 줄임
    import('@/lib/supabase/client').then(({ createClient }) => {
      const supabase = createClient();

      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          router.replace('/write');
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
          if (event === 'SIGNED_IN' && session) {
            router.replace('/write');
          }
        }
      );

      return () => subscription.unsubscribe();
    });
  }, [router]);

  return null;
}
