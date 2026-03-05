'use client';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#3B5CFF] flex items-center justify-center">
              <span className="text-white text-lg font-black">B</span>
            </div>
            <div>
              <h1 className="text-lg font-black text-white">블로그 라이터</h1>
              <p className="text-[10px] text-white/40 -mt-0.5 hidden sm:block">
                뷰티샵 블로그 글쓰기 도구
              </p>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <button className="text-sm text-white/60 hover:text-white transition-colors">
              사용 가이드
            </button>
            <button className="btn-primary text-sm py-2 px-5">
              시작하기
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
