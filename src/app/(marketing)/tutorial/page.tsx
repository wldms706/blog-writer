'use client';

import Link from 'next/link';
import Footer from '@/components/Footer';

const STEPS = [
  {
    num: '01',
    title: '회원가입 후 설정 페이지에서 매장 정보 입력',
    desc: `카카오/구글로 간편 가입 후, 설정 페이지에서 이름, 상호명, 샵 위치(주소)를 입력하세요.

샵 위치는 키워드 추천에 매우 중요하니 꼭 입력해주세요. 동까지 적을 필요는 없어요.

가게 정보(주소, 영업시간, 연락처, 주차)는 한 번만 저장하면 글 작성 시 자동으로 반영됩니다.`,
    image: '/tutorial/2.png',
  },
  {
    num: '02',
    title: '내 블로그 지수 확인하고 등록',
    desc: `블로그 지수를 모르신다면 "블라이에서 내 블로그 지수 확인하기" 버튼을 눌러 확인하세요.

외부 사이트지만 간단한 가입 후 바로 확인할 수 있습니다.

새로 만든 블로그라면 일반 또는 준최1을 선택하세요.`,
    image: '/tutorial/3.png',
  },
  {
    num: '03',
    title: '블라이에서 블로그 지수 측정',
    desc: `블라이에서 내 블로그 URL을 입력하면 지수, 노출 분석까지 한 번에 확인할 수 있어요.

측정된 지수를 블로그라이터 설정에 입력하면 맞춤 키워드를 추천해드립니다.`,
    image: '/tutorial/4.png',
  },
  {
    num: '04',
    title: '저장하고 글쓰기 시작',
    desc: `모든 정보를 입력했다면 "저장하고 글쓰기" 버튼을 눌러 본격적으로 글 작성을 시작하세요.`,
    image: '/tutorial/5.png',
  },
  {
    num: '05',
    title: '글 유형 선택',
    desc: `세 가지 스타일 중에서 원하는 글 유형을 선택하세요.

• 체험 후기형: 고객이 직접 방문한 후기 스타일
• 전문가 정보형: 원장이 전문 지식을 전달하는 스타일
• 브랜딩 글: 샵의 가치와 철학을 전달하는 글

같은 키워드라도 선택하는 스타일에 따라 글 느낌이 완전히 달라집니다.`,
    image: '/tutorial/6.png',
  },
  {
    num: '06',
    title: '업종 선택',
    desc: `뷰티 업종(반영구, 두피/탈모, 피부관리, 네일아트, 헤어, 메이크업, 왁싱, 속눈썹) 중에서 본인 업종을 선택하세요.

반영구는 별도 규제 모드로 안전하게 작성됩니다.`,
    image: '/tutorial/7.png',
  },
  {
    num: '07',
    title: '주제 선택',
    desc: `시술/고민별 주제 또는 일반 주제 중에서 글의 방향을 결정하세요.

선택한 주제에 따라 글의 구조와 방향이 달라집니다.`,
    image: '/tutorial/8.png',
  },
  {
    num: '08',
    title: '키워드 입력 (지역 + 세부키워드)',
    desc: `설정한 블로그 지수에 맞춰 추천 지역이 자동으로 뜹니다.

시/구 단위 키워드도 가능하니 동 단위와 섞어서 써보세요.

지역 + 세부키워드 조합으로 SEO 최적화 키워드를 만들 수 있습니다.`,
    image: '/tutorial/9.png',
  },
  {
    num: '09',
    title: '키워드 작성 꿀팁',
    desc: `서울은 너무 넓으니 구, 동 단위로 써주는 게 좋아요.

블로그 지수가 준최 1~3일 경우 동 단위로 키워드를 잡는 게 유리합니다.

같은 키워드를 반복해서 쓰면 안 좋으니 한 달에 한 번씩만 잡고 써주세요.`,
    image: '/tutorial/10.png',
  },
  {
    num: '10',
    title: '시술/매장 정보 입력 (선택)',
    desc: `원장님 샵의 시그니처 기법이나 효과를 어필하고 싶으면 이 부분을 채워주세요.

프로그램 이름, 한 줄 설명, 다른 곳과 다른 점, 어떤 분들에게 좋은지, 진행 과정 등을 구체적으로 적을수록 개성 있는 글이 만들어져요.`,
    image: '/tutorial/11.png',
  },
  {
    num: '11',
    title: 'AI 추천 제목 선택',
    desc: `AI가 추천한 5~7가지 클릭률 높은 제목 중 마음에 드는 것을 고르세요.

상식 파괴형, 손실 회피형, 숫자 증명형, 자아 흠집형 등 다양한 스타일이 제공됩니다.

직접 입력도 가능합니다.`,
    image: '/tutorial/14.png',
  },
  {
    num: '12',
    title: '글 생성 중',
    desc: `핵심 기준을 더 명확히 담기 위해 내용을 보강 중이에요.

글이 나오는데 최대 2분 정도 소요될 수 있으니 잠시만 기다려주세요.`,
    image: '/tutorial/15.png',
  },
  {
    num: '13',
    title: '완성된 글 복사하기',
    desc: `완성된 SEO 최적화 글을 "복사하기" 버튼으로 복사해서 네이버 블로그에 그대로 붙여넣기 하세요.

글자수는 1,200자 ~ 2,500자 사이로 최적화되어 있습니다.

편집가이드를 포함한 글자수이기 때문에, 블로그에 글 작성하실 때는 편집가이드 부분을 전부 삭제해주세요.`,
    image: '/tutorial/16.png',
  },
  {
    num: '14',
    title: '블로그 글쓰기 기본 규칙',
    desc: `1) 사진은 최소 7장
   (시술사진 + 작업자 사진 + 실내사진이 들어가면 더욱 좋음)

2) 썼던 사진은 절대 재탕하지 않기
   (이미지 세탁 필수)

3) 가독성을 위해 글자 색 입히기, 굵게, 기울기, 형광펜 등 포인트 주기

4) 인용문구 툴로 중요한 말은 강조하기

5) 반영구 업종은 카톡, 인스타 등 외부링크 사용 금지

6) 모바일 화면으로 맞춰놓고 글 쓰기`,
    image: '/tutorial/17.png',
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
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-black text-black mb-4">
              단계별 가이드
            </h2>
            <p className="text-gray-500">
              스크린샷과 함께 따라해보세요
            </p>
          </div>

          <div className="space-y-20">
            {STEPS.map((step, idx) => (
              <div
                key={step.num}
                className={`grid grid-cols-1 md:grid-cols-2 gap-10 items-center ${
                  idx % 2 === 1 ? 'md:[&>*:first-child]:order-2' : ''
                }`}
              >
                {/* 텍스트 */}
                <div>
                  <div className="text-7xl font-black text-[#3B5CFF]/15 mb-2 font-display leading-none">
                    {step.num}
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-black mb-4 leading-tight">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                    {step.desc}
                  </p>
                </div>

                {/* 이미지 */}
                <div className="rounded-2xl bg-gray-50 overflow-hidden border border-gray-200 shadow-md">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={step.image}
                    alt={`${step.num} ${step.title}`}
                    className="w-full h-auto"
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
