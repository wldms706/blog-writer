import type { ReactNode } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "./LogoutButton";
import HeaderLogo from "./HeaderLogo";
import OnboardingGuard from "./OnboardingGuard";
import Footer from "@/components/Footer";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 프로필에서 이름 조회
  let displayName = user?.email || '';
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('name')
      .eq('id', user.id)
      .single();

    if (profile?.name) {
      displayName = profile.name;
    }

    // 마지막 활동 시각 갱신 (카카오 알림용 — fire and forget)
    supabase
      .from('profiles')
      .update({ last_active_at: new Date().toISOString() })
      .eq('id', user.id)
      .then(() => {});
  }

  return (
    <div className="flex min-h-dvh flex-col bg-white text-black">
      {/* 온보딩 가드 (이름 미입력 시 온보딩으로 리다이렉트) */}
      <OnboardingGuard />

      {/* Topbar */}
      <header className="sticky top-0 z-50 bg-black text-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <HeaderLogo />

          <nav className="flex items-center gap-1 sm:gap-2">
            <Link href="/history" className="rounded-full px-3 sm:px-4 py-1.5 text-xs sm:text-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors">
              히스토리
            </Link>
            <Link href="/settings" className="rounded-full px-3 sm:px-4 py-1.5 text-xs sm:text-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors">
              설정
            </Link>
            <div className="hidden sm:block h-8 w-px bg-white/20" />
            {user && (
              <span className="hidden text-xs text-white/40 md:block">{displayName}</span>
            )}
            <LogoutButton />
          </nav>
        </div>
      </header>

      {/* Body */}
      <div className="mx-auto grid max-w-6xl grid-cols-12 gap-4 px-3 sm:px-4 py-4 sm:py-6">
        {/* Sidebar - 모바일에서 숨김 */}
        <aside className="hidden md:block md:col-span-3">
          <div className="sticky top-20 space-y-3">
            <div className="rounded-2xl bg-black p-4 text-white">
              <div className="mb-3 text-xs font-bold uppercase tracking-widest text-white/50">
                워크플로우
              </div>
              <SidebarItem active label="작성" desc="입력값을 정리합니다" />
              <SidebarItem label="자동 보정" desc="안정적으로 다듬습니다" />
              <SidebarItem label="완료" desc="복사/저장합니다" />
            </div>

            <div className="rounded-2xl bg-[#3B5CFF] p-4 text-white">
              <div className="text-xs font-bold uppercase tracking-widest text-white/60">상태</div>
              <div className="mt-2 flex items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold text-white">
                  안정화 모드
                </span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="col-span-12 md:col-span-9">
          <div className="rounded-2xl bg-white p-4 sm:p-6 shadow-lg">
            {children}
          </div>

          <div className="mt-4 text-[11px] text-gray-400 text-center md:text-left">
            * 안내 문구는 중립 톤으로만 표시됩니다.
          </div>
        </main>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

function SidebarItem({
  label,
  desc,
  active,
}: {
  label: string;
  desc: string;
  active?: boolean;
}) {
  return (
    <div
      className={[
        "rounded-xl p-3",
        active ? "bg-[#3B5CFF]" : "hover:bg-white/10",
      ].join(" ")}
    >
      <div className="flex items-center justify-between">
        <div className="text-sm font-bold">{label}</div>
        {active && (
          <span className="rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-bold">
            진행 중
          </span>
        )}
      </div>
      <div className="mt-1 text-[12px] text-white/60">{desc}</div>
    </div>
  );
}
