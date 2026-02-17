import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-black">
      <div className="text-center">
        <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold text-white tracking-tight">
          블로그 라이터
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-white/50">
          규칙은 시스템이 책임집니다
        </p>
      </div>

      <div className="mt-16">
        <Link
          href="/login"
          className="text-sm text-white/30 hover:text-white/60 transition-colors"
        >
          시작하기 →
        </Link>
      </div>
    </div>
  );
}
