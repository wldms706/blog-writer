import Link from 'next/link';
import LandingHeader from './LandingHeader';

const FEATURE_TAGS = [
  'SEO 최적화', '키워드 분석', '네이버 상위노출',
  '반영구 특화', 'AI 글쓰기', '규칙 자동 적용',
  '수강생 모집', '브랜딩 글', '키워드 추천',
];

export default function LandingPage() {
  return (
    <div className="min-h-dvh selection:bg-[#3B5CFF] selection:text-white flex flex-col">

      {/* === Section 1: Hero (Black) === */}
      <section className="bg-black text-white">
        <LandingHeader />

        {/* Hero Content */}
        <div className="flex flex-col items-center justify-center px-6 py-20 sm:py-32">
          <div className="text-center max-w-4xl">
            <h1 className="text-5xl sm:text-7xl md:text-[120px] font-black text-white leading-none tracking-tight">
              블로그
              <br />
              <span className="font-display-italic text-[#3B5CFF]">라이터</span>
            </h1>
            <p className="mt-8 sm:mt-12 text-lg sm:text-2xl text-white/60 font-light">
              뷰티샵 원장님을 위한 AI 블로그 글쓰기
            </p>
            <p className="mt-3 text-sm sm:text-base text-white/30">
              규칙은 시스템이 책임집니다
            </p>

            <div className="mt-12 sm:mt-16">
              <Link
                href="/signup"
                className="inline-block text-black bg-white rounded-full px-10 py-4 text-base sm:text-lg font-bold hover:bg-white/90 transition-all tracking-wide"
              >
                무료로 시작하기
              </Link>
            </div>

            <p className="mt-6 text-xs text-white/30">
              가입 즉시 하루 3회 무료 생성
            </p>
          </div>
        </div>
      </section>

      {/* === Section 2: Features (Blue) === */}
      <section className="bg-[#3B5CFF] text-white py-20 sm:py-28 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight">
            ALL YOUR
          </h2>
          <h2 className="text-3xl sm:text-5xl font-display-italic mt-1">
            blog needs
          </h2>
          <p className="mt-6 text-white/70 max-w-xl mx-auto">
            뷰티샵 블로그에 필요한 모든 기능을 한 곳에서.
            최고의 품질과 사용성을 보장합니다.
          </p>

          {/* Floating Pill Tags */}
          <div className="mt-12 flex flex-wrap justify-center gap-3">
            {FEATURE_TAGS.map((tag) => (
              <span
                key={tag}
                className="pill-tag text-sm"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-12">
            <Link
              href="/signup"
              className="inline-block border-2 border-white rounded-full px-8 py-3 text-sm font-bold hover:bg-white hover:text-[#3B5CFF] transition-all uppercase tracking-widest"
            >
              시작하기
            </Link>
          </div>
        </div>
      </section>

      {/* === Section 3: How it works (White) === */}
      <section className="bg-white text-black py-20 sm:py-28 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-black text-center mb-16">
            이렇게 작동합니다
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { num: '01', title: '정보 입력', desc: '업종, 키워드, 주제를 선택하면 AI가 최적의 구성을 설계합니다' },
              { num: '02', title: '자동 생성', desc: 'SEO 규칙과 네이버 로직을 반영한 고품질 블로그 글을 생성합니다' },
              { num: '03', title: '복사 & 발행', desc: '완성된 글을 복사해서 네이버 블로그에 바로 올리세요' },
            ].map((step) => (
              <div key={step.num} className="text-center sm:text-left">
                <div className="text-5xl font-black text-[#3B5CFF] mb-4 font-display">
                  {step.num}
                </div>
                <h3 className="text-xl font-black mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === Section 4: Pricing (Black) === */}
      <section className="bg-black text-white py-20 sm:py-28 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-black text-center mb-4">
            요금 안내
          </h2>
          <p className="text-white/50 text-center mb-12">
            업종에 맞는 플랜을 선택하세요
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white/10 border border-white/20 p-6 rounded-2xl flex flex-col">
              <p className="text-white/60 text-sm font-medium mb-2">무료</p>
              <p className="text-3xl font-black text-white mb-1">0원</p>
              <p className="text-white/40 text-xs mb-4">최초 3회 무료 글쓰기</p>
              <ul className="space-y-2 text-sm text-white/70 flex-1">
                <li>• 모든 업종 체험 가능</li>
                <li>• 기본 글 구조 5종</li>
              </ul>
              <Link href="/signup" className="mt-6 block text-center border border-white/30 text-white rounded-full py-2.5 text-sm font-bold hover:bg-white/10 transition-all">
                무료로 시작하기
              </Link>
            </div>
            <div className="bg-white/10 border border-white/20 p-6 rounded-2xl flex flex-col">
              <p className="text-white/60 text-sm font-medium mb-2">프로 (일반)</p>
              <p className="text-sm text-white/40 line-through mb-1">15,900원</p>
              <p className="text-3xl font-black text-white mb-1">9,900원<span className="text-base font-normal text-white/50">/월</span></p>
              <p className="text-yellow-400 text-xs font-bold mb-4">한 달간 할인 중</p>
              <ul className="space-y-2 text-sm text-white/70 flex-1">
                <li>• 반영구 제외 업종 가능</li>
                <li>• 모든 글 구조 사용</li>
                <li>• 무제한 히스토리</li>
                <li>• SEO 최적화</li>
              </ul>
              <p className="mt-4 text-xs text-white/40">업종추천 → 헤어, 왁싱, 속눈썹, 네일, 피부</p>
              <Link href="/subscribe" className="mt-3 block text-center bg-[#3B5CFF] text-white rounded-full py-2.5 text-sm font-bold hover:bg-[#2A45E0] transition-all">
                구독하기
              </Link>
            </div>
            <div className="bg-white border-2 border-white p-6 rounded-2xl relative flex flex-col">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#3B5CFF] text-white text-xs font-black px-3 py-1 rounded-full">반영구 업종</span>
              <p className="text-[#3B5CFF]/60 text-sm font-medium mb-2">프로 (반영구)</p>
              <p className="text-sm text-gray-400 line-through mb-1">19,900원</p>
              <p className="text-3xl font-black text-[#3B5CFF] mb-1">12,900원<span className="text-base font-normal text-[#3B5CFF]/50">/월</span></p>
              <p className="text-yellow-500 text-xs font-bold mb-4">한 달간 할인 중</p>
              <ul className="space-y-2 text-sm text-gray-600 flex-1">
                <li>• 반영구 포함 외 타업종 글 가능</li>
                <li>• 반영구 특화 글 구조</li>
                <li>• 규제 표현 자동 차단</li>
                <li>• SEO 최적화</li>
              </ul>
              <Link href="/subscribe" className="mt-6 block text-center bg-[#3B5CFF] text-white rounded-full py-2.5 text-sm font-bold hover:bg-[#2A45E0] transition-all">
                구독하기
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* === Footer (Black) === */}
      <footer className="bg-black px-6 sm:px-10 py-8 flex items-center justify-between text-white/30 text-xs">
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
