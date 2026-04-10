'use client';

import Link from 'next/link';
import Footer from '@/components/Footer';

const STEPS = [
  {
    num: '01',
    title: '회원가입 & 설정',
    desc: '카카오/구글로 간편 가입 후, 매장 정보(주소, 영업시간, 블로그 지수)를 입력하세요. 한 번만 입력하면 글 작성 시 자동으로 반영됩니다.',
    image: '/tutorial/step-01.png',
  },
  {
    num: '02',
    title: '글 유형 선택',
    desc: '체험 후기형 / 전문가 정보형 / 브랜딩 글 중에서 원하는 스타일을 선택하세요. 같은 키워드라도 글 느낌이 완전히 달라집니다.',
    image: '/tutorial/step-02.png',
  },
  {
    num: '03',
    title: '업종 & 주제 선택',
    desc: '뷰티 업종(네일, 헤어, 에스테틱 등)과 글 주제를 선택하세요. 반영구는 별도 규제 모드로 안전하게 작성됩니다.',
    image: '/tutorial/step-03.png',
  },
  {
    num: '04',
    title: '키워드 입력',
    desc: '설정한 블로그 지수에 맞춰 추천 지역이 자동으로 뜹니다. 지역 + 세부키워드 조합으로 SEO 최적화 키워드를 만들어보세요.',
    image: '/tutorial/step-04.png',
  },
  {
    num: '05',
    title: '시술 정보 입력',
    desc: '특별한 시술 정보가 있다면 추가하세요. 매장 정보는 설정에서 자동으로 불러옵니다.',
    image: '/tutorial/step-05.png',
  },
  {
    num: '06',
    title: '톤 선택',
    desc: '따뜻한 / 전문적인 / 캐주얼 톤 중에서 원하는 분위기를 선택하세요.',
    image: '/tutorial/step-06.png',
  },
  {
    num: '07',
    title: '제목 선택',
    desc: 'AI가 추천한 7가지 클릭률 높은 제목 중 마음에 드는 것을 고르세요. 직접 입력도 가능합니다.',
    image: '/tutorial/step-07.png',
  },
  {
    num: '08',
    title: '글 생성 & 복사',
    desc: '완성된 SEO 최적화 글을 복사해서 네이버 블로그에 바로 올리세요. 편집가이드대로 사진을 넣으면 상위노출 확률이 극대화됩니다.',
    image: '/tutorial/step-08.png',
  },
];

export default function TutorialPage() {
  return (
    <div className="min-h-dvh bg-white text-black flex flex-col">
      {/* 헤더 */}
      <header className="sticky top-0 z-50 bg-black text-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="text-lg font-black">
            블로그라이터
          </Link>
          <nav className="flex items-center gap-2">
            <Link href="/pricing" className="rounded-full px-4 py-1.5 text-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors">
              요금제
            </Link>
            <Link href="/signup" className="rounded-full bg-white text-black px-4 py-1.5 text-sm font-bold hover:bg-white/90 transition-colors">
              시작하기
            </Link>
          </nav>
        </div>
      </header>

      {/* 히어로 + 영상 */}
      <section className="bg-black text-white py-16 sm:py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight mb-4">
            사용 방법
          </h1>
          <p className="text-lg sm:text-xl text-white/60 mb-12">
            영상과 단계별 가이드로 쉽게 따라해보세요
          </p>

          <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-black border border-white/10">
            <video
              src="/tutorial.mp4"
              controls
              playsInline
              className="w-full h-auto"
            />
          </div>
        </div>
      </section>

      {/* 단계별 가이드 */}
      <section className="bg-white py-16 sm:py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-black text-black mb-4">
              단계별 가이드
            </h2>
            <p className="text-gray-500">
              8단계로 완성되는 블로그 글
            </p>
          </div>

          <div className="space-y-16">
            {STEPS.map((step, idx) => (
              <div
                key={step.num}
                className={`grid grid-cols-1 md:grid-cols-2 gap-8 items-center ${
                  idx % 2 === 1 ? 'md:[&>*:first-child]:order-2' : ''
                }`}
              >
                {/* 텍스트 */}
                <div>
                  <div className="text-6xl font-black text-[#3B5CFF]/20 mb-2 font-display">
                    {step.num}
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-black mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                {/* 이미지 자리 */}
                <div className="rounded-2xl bg-gray-100 aspect-[4/3] overflow-hidden border border-gray-200 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={step.image}
                    alt={`${step.num} ${step.title}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = '<div class="text-gray-400 text-sm text-center px-4">스크린샷이 들어갈 자리</div>';
                      }
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#3B5CFF] text-white py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-5xl font-black mb-4">
            지금 바로 시작해보세요
          </h2>
          <p className="text-white/70 mb-8 text-lg">
            가입 즉시 3회 무료 체험 가능
          </p>
          <Link
            href="/signup"
            className="inline-block bg-white text-[#3B5CFF] rounded-full px-10 py-4 text-lg font-black hover:bg-white/90 transition-all"
          >
            무료로 시작하기
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
