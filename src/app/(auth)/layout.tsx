import type { ReactNode } from 'react';
import Footer from '@/components/Footer';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-slate-50">
      <div className="flex flex-1 items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
              <span className="text-lg font-bold text-white">B</span>
            </div>
            <h1 className="text-lg font-semibold text-slate-900">블로그 라이터</h1>
            <p className="text-xs text-slate-500">규칙은 시스템이 책임집니다</p>
          </div>
          {children}
        </div>
      </div>
      <Footer />
    </div>
  );
}
