import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-[#0047FF] selection:bg-white selection:text-blue-600 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 sm:px-10 py-6">
        <div className="text-white text-lg font-bold tracking-tight">
          블로그라이터
        </div>
        <Link
          href="/login"
          className="text-white border-2 border-white px-6 py-2 text-sm font-bold hover:bg-white hover:text-[#0047FF] transition-all uppercase tracking-widest"
        >
          LOGIN
        </Link>
      </header>

      {/* Hero */}
      <main className="flex-grow flex items-center justify-center px-6">
        <div className="text-center max-w-4xl">
          <h1 className="text-5xl sm:text-7xl md:text-[120px] font-black text-white leading-none tracking-tight">
            블로그
            <br />
            라이터
          </h1>
          <p className="mt-8 sm:mt-12 text-lg sm:text-2xl text-white/70 font-light">
            뷰티샵 원장님을 위한 AI 블로그 글쓰기
          </p>
          <p className="mt-3 text-sm sm:text-base text-white/40">
            규칙은 시스템이 책임집니다
          </p>

          <div className="mt-12 sm:mt-16">
            <Link
              href="/signup"
              className="inline-block text-[#0047FF] bg-white px-10 py-4 text-base sm:text-lg font-bold hover:bg-white/90 transition-all tracking-wide"
            >
              무료로 시작하기
            </Link>
          </div>

          <p className="mt-6 text-xs text-white/30">
            가입 즉시 하루 3회 무료 생성
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 sm:px-10 py-6 flex items-center justify-between text-white/30 text-xs">
        <span>© 2026 블로그라이터</span>
        <div className="flex gap-4">
          <Link href="/pricing" className="hover:text-white/60 transition-colors">요금</Link>
          <Link href="/terms" className="hover:text-white/60 transition-colors">이용약관</Link>
          <Link href="/privacy" className="hover:text-white/60 transition-colors">개인정보</Link>
        </div>
      </footer>
    </div>
  );
}
