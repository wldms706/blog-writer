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

      {/* Pricing Section */}
      <section className="px-6 sm:px-10 py-16 sm:py-24">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-white text-center mb-12">
            요금 안내
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* 무료 */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-6 rounded-2xl">
              <p className="text-white/60 text-sm font-medium mb-2">무료</p>
              <p className="text-3xl font-black text-white mb-1">0원</p>
              <p className="text-white/40 text-xs mb-4">하루 3회 생성</p>
              <ul className="space-y-2 text-sm text-white/70">
                <li>• 기본 글 구조 5종</li>
                <li>• 히스토리 최근 10개</li>
              </ul>
            </div>
            {/* 일반 */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-6 rounded-2xl">
              <p className="text-white/60 text-sm font-medium mb-2">프로 (일반)</p>
              <p className="text-3xl font-black text-white mb-1">9,900원<span className="text-base font-normal text-white/50">/월</span></p>
              <p className="text-white/40 text-xs mb-4">무제한 생성</p>
              <ul className="space-y-2 text-sm text-white/70">
                <li>• 모든 글 구조 사용</li>
                <li>• 무제한 히스토리</li>
                <li>• SEO 최적화</li>
              </ul>
            </div>
            {/* 반영구 */}
            <div className="bg-white border-2 border-white p-6 rounded-2xl relative">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#0047FF] text-white text-xs font-black px-3 py-1 rounded-full">반영구 업종</span>
              <p className="text-[#0047FF]/60 text-sm font-medium mb-2">프로 (반영구)</p>
              <p className="text-3xl font-black text-[#0047FF] mb-1">12,900원<span className="text-base font-normal text-[#0047FF]/50">/월</span></p>
              <p className="text-gray-400 text-xs mb-4">무제한 생성</p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• 반영구 특화 글 구조</li>
                <li>• 규제 표현 자동 차단</li>
                <li>• SEO 최적화</li>
              </ul>
            </div>
          </div>
          <div className="text-center mt-8">
            <Link
              href="/signup"
              className="inline-block text-[#0047FF] bg-white px-8 py-3 text-sm font-bold hover:bg-white/90 transition-all"
            >
              무료로 시작하기
            </Link>
          </div>
        </div>
      </section>

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
