'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      className="rounded-full px-3 py-1.5 text-sm text-white/50 hover:bg-white/10 hover:text-white transition-colors"
    >
      로그아웃
    </button>
  );
}
