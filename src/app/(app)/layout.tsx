import type { ReactNode } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "./LogoutButton";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-dvh bg-slate-50 text-slate-900">
      {/* Topbar */}
      <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600">
              <span className="text-sm font-bold text-white">찐</span>
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold">블로그 라이터</div>
              <div className="text-[11px] text-slate-500">규칙은 시스템이 책임집니다</div>
            </div>
          </Link>

          <nav className="flex items-center gap-2">
            <Link href="/history" className="rounded-lg px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100">
              히스토리
            </Link>
            <Link href="/settings" className="rounded-lg px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100">
              설정
            </Link>
            <div className="h-8 w-px bg-slate-200" />
            {user && (
              <span className="hidden text-xs text-slate-400 sm:block">{user.email}</span>
            )}
            <LogoutButton />
          </nav>
        </div>
      </header>

      {/* Body */}
      <div className="mx-auto grid max-w-6xl grid-cols-12 gap-4 px-4 py-6">
        {/* Sidebar */}
        <aside className="col-span-12 md:col-span-3">
          <div className="sticky top-20 space-y-3">
            <div className="rounded-2xl border bg-white p-3">
              <div className="mb-2 text-xs font-medium text-slate-500">워크플로우</div>
              <SidebarItem active label="작성" desc="입력값을 정리합니다" />
              <SidebarItem label="자동 보정" desc="안정적으로 다듬습니다" />
              <SidebarItem label="완료" desc="복사/저장합니다" />
            </div>

            <div className="rounded-2xl border bg-white p-3">
              <div className="text-xs font-medium text-slate-500">상태</div>
              <div className="mt-2 flex items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-[11px] font-medium text-blue-700">
                  안정화 모드
                </span>
                <span className="text-[11px] text-slate-500">규칙/수치는 노출되지 않습니다</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="col-span-12 md:col-span-9">
          <div className="rounded-2xl border bg-white p-5">
            {children}
          </div>

          <div className="mt-4 text-[11px] text-slate-500">
            * 안내 문구는 중립 톤으로만 표시됩니다.
          </div>
        </main>
      </div>
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
        active ? "bg-blue-50 ring-1 ring-blue-100" : "hover:bg-slate-50",
      ].join(" ")}
    >
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">{label}</div>
        {active && (
          <span className="text-[11px] font-medium text-blue-700">진행 중</span>
        )}
      </div>
      <div className="mt-1 text-[12px] text-slate-500">{desc}</div>
    </div>
  );
}
