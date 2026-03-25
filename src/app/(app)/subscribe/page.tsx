'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { PaymentWidgetInstance, loadPaymentWidget } from '@tosspayments/payment-widget-sdk';
import { createClient } from '@/lib/supabase/client';
import { nanoid } from 'nanoid';

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
    price: 12900,
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
    price: 9900,
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
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [step, setStep] = useState<'select' | 'pay'>('select');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const paymentWidgetRef = useRef<PaymentWidgetInstance | null>(null);
  const [widgetReady, setWidgetReady] = useState(false);

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

  // step이 'pay'로 전환되면 위젯 로드
  useEffect(() => {
    if (step !== 'pay' || !selectedPlan || !user || !clientKey) return;

    let cancelled = false;

    const initWidget = async () => {
      try {
        setWidgetReady(false);
        setError(null);

        const paymentWidget = await loadPaymentWidget(clientKey, `customer_${user.id}`);
        if (cancelled) return;

        paymentWidgetRef.current = paymentWidget;

        await paymentWidget.renderPaymentMethods(
          '#payment-widget',
          { value: selectedPlan.price },
        );

        await paymentWidget.renderAgreement('#agreement-widget');

        if (!cancelled) setWidgetReady(true);
      } catch (err) {
        if (!cancelled) {
          console.error('결제위젯 로드 실패:', err);
          setError('결제위젯을 불러오는데 실패했습니다. 새로고침 해주세요.');
        }
      }
    };

    // DOM이 확실히 마운트된 후 실행
    const timer = setTimeout(initWidget, 100);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [step, selectedPlan, user]);

  const handleSelectPlan = useCallback((plan: Plan) => {
    setSelectedPlan(plan);
  }, []);

  const handleGoToPay = useCallback(() => {
    if (selectedPlan) {
      setStep('pay');
    }
  }, [selectedPlan]);

  const handleBackToSelect = useCallback(() => {
    setStep('select');
    setWidgetReady(false);
    paymentWidgetRef.current = null;
  }, []);

  // 결제 요청
  const handlePayment = async () => {
    if (!selectedPlan || !user || !paymentWidgetRef.current || !widgetReady) return;

    setIsLoading(true);
    setError(null);

    try {
      await paymentWidgetRef.current.requestPayment({
        orderId: `order_${nanoid()}`,
        orderName: `블로그라이터 ${selectedPlan.name} 월 구독`,
        successUrl: `${window.location.origin}/subscribe/success?planId=${selectedPlan.id}`,
        failUrl: `${window.location.origin}/subscribe/fail`,
        customerEmail: user.email,
        customerName: user.email.split('@')[0],
      });
    } catch (err) {
      console.error('결제 요청 실패:', err);
      setError(err instanceof Error ? err.message : '결제 요청에 실패했습니다.');
      setIsLoading(false);
    }
  };

  // 1단계: 플랜 선택
  if (step === 'select') {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">구독 플랜 선택</h1>
          <p className="text-gray-600">업종에 맞는 플랜을 선택하고 결제를 진행하세요</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {PLANS.map((plan) => (
            <button
              key={plan.id}
              onClick={() => handleSelectPlan(plan)}
              className={[
                'relative text-left rounded-2xl border-none p-6 transition-all',
                selectedPlan?.id === plan.id
                  ? 'bg-[#3B5CFF] text-white shadow-xl'
                  : 'bg-[#F5F5F5] hover:bg-gray-200',
              ].join(' ')}
            >
              {plan.badge && (
                <span className="absolute -top-3 left-4 inline-block rounded-full px-3 py-1 text-xs font-black text-black bg-white shadow-md">
                  {plan.badge}
                </span>
              )}
              <div className="mb-4">
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <p className="text-sm opacity-60 mt-1">{plan.description}</p>
              </div>
              <div className="mb-4">
                <span className="text-3xl font-black">{plan.price.toLocaleString()}원</span>
                <span className="opacity-60">/월</span>
              </div>
              <ul className="space-y-2">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm">
                    <svg className="w-4 h-4 text-[#3B5CFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              {selectedPlan?.id === plan.id && (
                <div className="absolute top-4 right-4">
                  <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                    <svg className="w-4 h-4 text-[#3B5CFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>

        {selectedPlan && (
          <div className="text-center">
            <button
              onClick={handleGoToPay}
              className="bg-[#3B5CFF] text-white rounded-full px-10 py-3 text-sm font-bold hover:bg-[#2A45E0] transition-all"
            >
              {selectedPlan.price.toLocaleString()}원 결제하기
            </button>
          </div>
        )}

        <div className="mt-8 bg-black rounded-2xl p-4 text-sm text-white">
          <h3 className="font-medium text-white mb-2">결제 안내</h3>
          <ul className="space-y-1">
            <li>• 월 정기결제로 진행되며, 매월 결제일에 자동 결제됩니다.</li>
            <li>• 결제일로부터 7일 이내 서비스 미사용 시 전액 환불 가능합니다.</li>
            <li>• 구독 취소는 설정 페이지에서 언제든 가능합니다.</li>
          </ul>
        </div>
      </div>
    );
  }

  // 2단계: 결제
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-6">
        <button onClick={handleBackToSelect} className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          플랜 다시 선택
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">결제 정보</h2>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-700">
            <p className="font-medium">오류 발생</p>
            <p>{error}</p>
          </div>
        )}

        <div className="mb-4 rounded-lg bg-gray-50 p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium text-gray-900">{selectedPlan?.name}</p>
              <p className="text-sm text-gray-500">월 정기 구독</p>
            </div>
            <p className="text-xl font-bold text-gray-900">
              {selectedPlan?.price.toLocaleString()}원
            </p>
          </div>
        </div>

        {/* 토스 결제위젯 — 항상 DOM에 존재 */}
        <div id="payment-widget" className="mb-4" />
        <div id="agreement-widget" className="mb-4" />

        {!widgetReady && !error && (
          <div className="text-center py-8">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-[#3B5CFF]" />
            <p className="mt-3 text-sm text-gray-400">결제 수단을 불러오는 중...</p>
          </div>
        )}

        <button
          onClick={handlePayment}
          disabled={isLoading || !user || !widgetReady}
          className={[
            'w-full py-3 font-bold transition-colors rounded-full',
            !isLoading && user && widgetReady
              ? 'bg-[#3B5CFF] text-white hover:bg-[#2A45E0]'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed',
          ].join(' ')}
        >
          {isLoading ? '결제 진행 중...' : `${selectedPlan?.price.toLocaleString()}원 결제하기`}
        </button>
      </div>
    </div>
  );
}
