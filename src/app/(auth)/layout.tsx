import type { ReactNode } from 'react';
import Footer from '@/components/Footer';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-black">
      <div className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#3B5CFF]">
              <span className="text-xl font-black text-white">B</span>
            </div>
            <h1 className="text-xl font-black text-white">블로그 라이터</h1>
            <p className="text-xs text-white/40">규칙은 시스템이 책임집니다</p>
          </div>
          {children}
        </div>
      </div>
      <Footer />
    </div>
  );
}
