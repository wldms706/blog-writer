'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function LandingHeader() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });
  }, []);

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-10 py-4 sm:py-6">
      <div className="flex min-w-0 items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-[#3B5CFF] flex items-center justify-center">
          <span className="text-white text-sm font-black">B</span>
        </div>
        <span className="text-white text-base sm:text-lg font-black tracking-tight">
          블로그라이터
        </span>
      </div>
      {isLoggedIn ? (
        <Link
          href="/write"
          className="text-black bg-white shrink-0 rounded-full px-4 sm:px-6 py-2 text-sm font-bold hover:bg-white/90 transition-all"
        >
          글쓰기
        </Link>
      ) : (
        <Link
          href="/login"
          className="text-white border-2 border-white shrink-0 rounded-full px-4 sm:px-6 py-2 text-sm font-bold hover:bg-white hover:text-black transition-all uppercase tracking-widest"
        >
          LOGIN
        </Link>
      )}
    </header>
  );
}
