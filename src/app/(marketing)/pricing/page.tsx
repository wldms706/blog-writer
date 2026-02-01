import Link from 'next/link';
import Footer from '@/components/Footer';

export const metadata = {
  title: '요금안내 | 블로그라이터',
  description: '블로그라이터 요금제 안내 - 반영구, 일반업종 맞춤 플랜',
};

const plans = [
  {
    name: '무료',
    price: '0',
    period: '',
    description: '서비스를 먼저 체험해보세요',
    features: [
      { text: '1일 3회 글 생성', included: true },
      { text: '기본 글 구조 5종', included: true },
      { text: '히스토리 저장 (최근 10개)', included: true },
      { text: '무제한 글 생성', included: false },
      { text: '모든 글 구조 사용', included: false },
      { text: '무제한 히스토리', included: false },
    ],
    cta: '무료로 시작하기',
    ctaLink: '/signup',
    highlighted: false,
  },
  {
    name: '프로 (반영구)',
    price: '19,900',
    period: '/월',
    description: '반영구 업종 특화 블로그 글 생성',
    badge: '반영구 업종',
    features: [
      { text: '무제한 글 생성', included: true },
      { text: '반영구 특화 글 구조 10종+', included: true },
      { text: '무제한 히스토리', included: true },
      { text: 'SEO 최적화 글쓰기', included: true },
      { text: '업종 맞춤 키워드 추천', included: true },
      { text: '우선 고객 지원', included: true },
    ],
    cta: '프로 시작하기',
    ctaLink: '/signup',
    highlighted: true,
  },
  {
    name: '프로 (일반)',
    price: '14,900',
    period: '/월',
    description: '다양한 업종을 위한 블로그 글 생성',
    badge: '일반 업종',
    features: [
      { text: '무제한 글 생성', included: true },
      { text: '범용 글 구조 8종+', included: true },
      { text: '무제한 히스토리', included: true },
      { text: 'SEO 최적화 글쓰기', included: true },
      { text: '업종 맞춤 키워드 추천', included: true },
      { text: '우선 고객 지원', included: true },
    ],
    cta: '프로 시작하기',
    ctaLink: '/signup',
    highlighted: false,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-dvh bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <span className="text-sm font-bold text-white">B</span>
            </div>
            <span className="font-semibold text-slate-900">블로그라이터</span>
          </Link>
          <nav className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-lg px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
            >
              로그인
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              시작하기
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-16">
          {/* Hero */}
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-slate-900 mb-4">
              요금 안내
            </h1>
            <p className="text-slate-600 max-w-xl mx-auto">
              업종에 맞는 플랜을 선택하세요. 7일 이내 미사용 시 전액 환불됩니다.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={[
                  'relative rounded-2xl border bg-white p-6 flex flex-col',
                  plan.highlighted
                    ? 'border-blue-500 ring-2 ring-blue-500'
                    : 'border-slate-200',
                ].join(' ')}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-block rounded-full bg-blue-600 px-3 py-1 text-xs font-medium text-white">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-slate-900 mb-1">
                    {plan.name}
                  </h2>
                  <p className="text-sm text-slate-500">{plan.description}</p>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-slate-900">
                      {plan.price === '0' ? '무료' : `₩${plan.price}`}
                    </span>
                    {plan.period && (
                      <span className="text-slate-500">{plan.period}</span>
                    )}
                  </div>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      {feature.included ? (
                        <svg
                          className="w-5 h-5 text-blue-600 shrink-0 mt-0.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-5 h-5 text-slate-300 shrink-0 mt-0.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      )}
                      <span
                        className={
                          feature.included ? 'text-slate-700' : 'text-slate-400'
                        }
                      >
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.ctaLink}
                  className={[
                    'block w-full rounded-lg py-2.5 text-center text-sm font-medium transition',
                    plan.highlighted
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200',
                  ].join(' ')}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>

          {/* FAQ Section */}
          <div className="mt-20 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">
              자주 묻는 질문
            </h2>
            <div className="space-y-4">
              <FaqItem
                question="반영구 업종과 일반 업종의 차이가 뭔가요?"
                answer="반영구 업종 플랜은 눈썹문신, 반영구화장, 속눈썹 등 반영구 시술 관련 키워드와 글 구조가 특화되어 있습니다. 일반 업종 플랜은 카페, 식당, 헬스장 등 다양한 업종에 맞는 범용적인 글 구조를 제공합니다."
              />
              <FaqItem
                question="결제는 어떻게 하나요?"
                answer="카드 정기결제 방식으로 매월 자동 결제됩니다. 결제일은 최초 구독 시작일 기준입니다."
              />
              <FaqItem
                question="환불 정책이 어떻게 되나요?"
                answer="결제일로부터 7일 이내 서비스 미사용 시 전액 환불이 가능합니다. 7일 이후 또는 서비스 사용 시에는 환불이 불가합니다."
              />
              <FaqItem
                question="구독 취소는 어떻게 하나요?"
                answer="설정 페이지에서 언제든 구독을 취소할 수 있습니다. 취소 시 다음 결제일부터 서비스가 중단되며, 남은 기간은 계속 이용 가능합니다."
              />
              <FaqItem
                question="플랜 변경이 가능한가요?"
                answer="네, 설정 페이지에서 플랜 변경이 가능합니다. 변경 시 차액은 일할 계산되어 적용됩니다."
              />
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-20 text-center">
            <div className="inline-block rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-white">
              <h2 className="text-2xl font-bold mb-2">
                지금 바로 시작하세요
              </h2>
              <p className="text-blue-100 mb-6">
                무료로 시작하고, 필요하면 업그레이드하세요
              </p>
              <Link
                href="/signup"
                className="inline-block rounded-lg bg-white px-6 py-2.5 text-sm font-medium text-blue-600 hover:bg-blue-50 transition"
              >
                무료로 시작하기
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="group rounded-xl border bg-white p-4">
      <summary className="flex cursor-pointer items-center justify-between font-medium text-slate-900">
        {question}
        <svg
          className="w-5 h-5 text-slate-400 group-open:rotate-180 transition-transform"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </summary>
      <p className="mt-3 text-sm text-slate-600 leading-relaxed">{answer}</p>
    </details>
  );
}
