'use client';

import { useEffect, useState } from 'react';
import { loadTossPayments } from '@tosspayments/tosspayments-sdk';
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [payMethod, setPayMethod] = useState<string>('CARD');

  const PAY_METHODS = [
    { id: 'CARD', label: '카드' },
    { id: 'TOSSPAY', label: '토스페이' },
    { id: 'KAKAOPAY', label: '카카오페이' },
    { id: 'TRANSFER', label: '계좌이체' },
  ];

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

  // API 개별 연동 방식 결제
  const handlePayment = async () => {
    if (!selectedPlan || !user || !clientKey) return;

    setIsLoading(true);
    setError(null);

    try {
      const tossPayments = await loadTossPayments(clientKey);
      const payment = tossPayments.payment({ customerKey: `customer_${user.id}` });

      await payment.requestPayment({
        method: payMethod,
        amount: { currency: 'KRW', value: selectedPlan.price },
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
            onClick={() => setSelectedPlan(plan)}
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
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-700">
              <p className="font-medium">오류 발생</p>
              <p>{error}</p>
            </div>
          )}
          <div className="mb-4 rounded-lg bg-gray-50 p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-900">{selectedPlan.name}</p>
                <p className="text-sm text-gray-500">월 정기 구독</p>
              </div>
              <p className="text-xl font-bold text-gray-900">{selectedPlan.price.toLocaleString()}원</p>
            </div>
          </div>
          {/* 결제수단 선택 */}
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">결제수단</p>
            <div className="flex flex-wrap gap-2">
              {PAY_METHODS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setPayMethod(m.id)}
                  className={[
                    'px-4 py-2 rounded-full text-sm font-medium transition-all',
                    payMethod === m.id
                      ? 'bg-[#3B5CFF] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                  ].join(' ')}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handlePayment}
            disabled={isLoading || !user}
            className={[
              'w-full py-3 font-bold transition-colors rounded-full',
              !isLoading && user
                ? 'bg-[#3B5CFF] text-white hover:bg-[#2A45E0]'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed',
            ].join(' ')}
          >
            {isLoading ? '결제 페이지로 이동 중...' : `${selectedPlan.price.toLocaleString()}원 결제하기`}
          </button>
          {!user && <p className="mt-2 text-center text-sm text-gray-500">로그인이 필요합니다</p>}
        </div>
      )}

      <div className="bg-black rounded-2xl p-4 text-sm text-white">
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
