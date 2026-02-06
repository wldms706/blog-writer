'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { loadTossPayments, TossPaymentsWidgets } from '@tosspayments/tosspayments-sdk';
import { createClient } from '@/lib/supabase/client';

interface Plan {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  badge?: string;
}

const PLANS: Plan[] = [
  {
    id: 'pro_permanent',
    name: '프로 (반영구)',
    price: 19900,
    description: '반영구 업종 특화 블로그 글 생성',
    badge: '반영구 업종',
    features: [
      '무제한 글 생성',
      '반영구 특화 글 구조 10종+',
      '무제한 히스토리',
      'SEO 최적화 글쓰기',
      '업종 맞춤 키워드 추천',
      '우선 고객 지원',
    ],
  },
  {
    id: 'pro_general',
    name: '프로 (일반)',
    price: 14900,
    description: '다양한 업종을 위한 블로그 글 생성',
    badge: '일반 업종',
    features: [
      '무제한 글 생성',
      '범용 글 구조 8종+',
      '무제한 히스토리',
      'SEO 최적화 글쓰기',
      '업종 맞춤 키워드 추천',
      '우선 고객 지원',
    ],
  },
];

const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || '';

export default function SubscribePage() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [widgets, setWidgets] = useState<TossPaymentsWidgets | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const paymentMethodRef = useRef<HTMLDivElement>(null);
  const agreementRef = useRef<HTMLDivElement>(null);

  // 유저 정보 가져오기
  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser({ id: user.id, email: user.email || '' });
      }
    };
    getUser();
  }, []);

  // 토스페이먼츠 위젯 초기화
  useEffect(() => {
    if (!user || !selectedPlan) return;

    const initWidgets = async () => {
      try {
        const tossPayments = await loadTossPayments(clientKey);
        const customerKey = `customer_${user.id}`;

        const paymentWidgets = tossPayments.widgets({
          customerKey,
        });

        // 결제 금액 설정
        await paymentWidgets.setAmount({
          currency: 'KRW',
          value: selectedPlan.price,
        });

        setWidgets(paymentWidgets);
      } catch (error) {
        console.error('위젯 초기화 실패:', error);
      }
    };

    initWidgets();
  }, [user, selectedPlan]);

  // 위젯 렌더링
  useEffect(() => {
    if (!widgets || !paymentMethodRef.current || !agreementRef.current) return;

    const renderWidgets = async () => {
      try {
        // 결제 수단 위젯 렌더링
        await widgets.renderPaymentMethods({
          selector: '#payment-method',
          variantKey: 'DEFAULT',
        });

        // 이용약관 위젯 렌더링
        await widgets.renderAgreement({
          selector: '#agreement',
          variantKey: 'AGREEMENT',
        });

        setIsReady(true);
      } catch (error) {
        console.error('위젯 렌더링 실패:', error);
      }
    };

    renderWidgets();
  }, [widgets]);

  // 결제 요청
  const handlePayment = async () => {
    if (!widgets || !selectedPlan || !user) return;

    setIsLoading(true);

    try {
      // 빌링키 발급 요청 (정기결제용)
      await widgets.requestPayment({
        orderId: `order_${Date.now()}_${user.id}`,
        orderName: `블로그라이터 ${selectedPlan.name} 월 구독`,
        successUrl: `${window.location.origin}/subscribe/success?planId=${selectedPlan.id}`,
        failUrl: `${window.location.origin}/subscribe/fail`,
        customerEmail: user.email,
        customerName: user.email.split('@')[0],
      });
    } catch (error) {
      console.error('결제 요청 실패:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">구독 플랜 선택</h1>
        <p className="text-slate-600">업종에 맞는 플랜을 선택하고 결제를 진행하세요</p>
      </div>

      {/* 플랜 선택 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {PLANS.map((plan) => (
          <button
            key={plan.id}
            onClick={() => {
              setSelectedPlan(plan);
              setIsReady(false);
            }}
            className={[
              'relative text-left rounded-2xl border p-6 transition-all',
              selectedPlan?.id === plan.id
                ? 'border-blue-500 ring-2 ring-blue-500 bg-blue-50/30'
                : 'border-slate-200 bg-white hover:border-slate-300',
            ].join(' ')}
          >
            {plan.badge && (
              <span className="absolute -top-3 left-4 inline-block rounded-full px-3 py-1 text-xs font-medium text-white bg-blue-600">
                {plan.badge}
              </span>
            )}

            <div className="mb-4">
              <h3 className="text-lg font-semibold text-slate-900">{plan.name}</h3>
              <p className="text-sm text-slate-500 mt-1">{plan.description}</p>
            </div>

            <div className="mb-4">
              <span className="text-3xl font-bold text-slate-900">
                {plan.price.toLocaleString()}원
              </span>
              <span className="text-slate-500">/월</span>
            </div>

            <ul className="space-y-2">
              {plan.features.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-2 text-sm text-slate-600">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>

            {selectedPlan?.id === plan.id && (
              <div className="absolute top-4 right-4">
                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* 결제 위젯 영역 */}
      {selectedPlan && (
        <div className="bg-white rounded-2xl border p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">결제 정보</h2>

          {/* 결제 수단 */}
          <div id="payment-method" ref={paymentMethodRef} className="mb-4" />

          {/* 이용 약관 */}
          <div id="agreement" ref={agreementRef} className="mb-6" />

          {/* 결제 버튼 */}
          <button
            onClick={handlePayment}
            disabled={!isReady || isLoading}
            className={[
              'w-full py-3 rounded-xl font-medium transition-colors',
              isReady && !isLoading
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed',
            ].join(' ')}
          >
            {isLoading ? '결제 처리 중...' : `${selectedPlan.price.toLocaleString()}원 결제하기`}
          </button>
        </div>
      )}

      {/* 안내 사항 */}
      <div className="bg-slate-100 rounded-xl p-4 text-sm text-slate-600">
        <h3 className="font-medium text-slate-900 mb-2">결제 안내</h3>
        <ul className="space-y-1">
          <li>• 월 정기결제로 진행되며, 매월 결제일에 자동 결제됩니다.</li>
          <li>• 결제일로부터 7일 이내 서비스 미사용 시 전액 환불 가능합니다.</li>
          <li>• 구독 취소는 설정 페이지에서 언제든 가능합니다.</li>
        </ul>
      </div>
    </div>
  );
}
