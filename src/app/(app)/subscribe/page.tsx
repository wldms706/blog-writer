'use client';

import { useEffect, useState } from 'react';
import { loadTossPayments } from '@tosspayments/tosspayments-sdk';
import { createClient } from '@/lib/supabase/client';
const VALID_COUPONS: Record<string, { description: string; firstMonthFree: boolean; discountPercent: number }> = {
  EAZY10: { description: '첫 달 무료 + 평생 10% 할인', firstMonthFree: true, discountPercent: 10 },
};

interface Plan {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  description: string;
  features: string[];
  badge?: string;
}

const PLANS: Plan[] = [
  {
    id: 'pro_permanent',
    name: '프로 (반영구)',
    price: 12900,
    originalPrice: 19900,
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
    originalPrice: 15900,
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
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState('');

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
  const handleApplyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) return;
    const coupon = VALID_COUPONS[code];
    if (coupon) {
      setCouponApplied(true);
      setCouponError('');
    } else {
      setCouponApplied(false);
      setCouponError('유효하지 않은 쿠폰 코드입니다.');
    }
  };

  const appliedCoupon = couponApplied ? VALID_COUPONS[couponCode.trim().toUpperCase()] : null;

  const getDisplayPrice = (price: number) => {
    if (appliedCoupon?.firstMonthFree) return 0;
    if (appliedCoupon?.discountPercent) return Math.round(price * (1 - appliedCoupon.discountPercent / 100));
    return price;
  };

  const handlePayment = async () => {
    if (!selectedPlan || !user || !clientKey) return;

    setIsLoading(true);
    setError(null);

    try {
      const tossPayments = await loadTossPayments(clientKey);
      const customerKey = `customer_${user.id}`;
      const payment = tossPayments.payment({ customerKey });

      const couponParam = couponApplied ? `&coupon=${couponCode.trim().toUpperCase()}` : '';

      // 자동결제(빌링) 카드 등록 요청
      await payment.requestBillingAuth({
        method: 'CARD',
        successUrl: `${window.location.origin}/subscribe/success?planId=${selectedPlan.id}${couponParam}`,
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
              <p className={`text-sm line-through ${selectedPlan?.id === plan.id ? 'text-white/40' : 'text-gray-400'}`}>{plan.originalPrice.toLocaleString()}원</p>
              <span className="text-3xl font-black">{plan.price.toLocaleString()}원</span>
              <span className="opacity-60">/월</span>
              <p className={`text-xs font-bold mt-1 ${selectedPlan?.id === plan.id ? 'text-yellow-300' : 'text-yellow-500'}`}>한 달간 할인 중</p>
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

          {/* 쿠폰 입력 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">쿠폰 코드</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => { setCouponCode(e.target.value); setCouponApplied(false); setCouponError(''); }}
                placeholder="쿠폰 코드를 입력하세요"
                className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#3B5CFF]"
              />
              <button
                onClick={handleApplyCoupon}
                className="px-4 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-800"
              >
                적용
              </button>
            </div>
            {couponError && <p className="text-xs text-red-500 mt-1">{couponError}</p>}
            {couponApplied && appliedCoupon && (
              <div className="mt-2 p-3 rounded-lg bg-green-50 border border-green-200">
                <p className="text-sm text-green-700 font-medium">쿠폰 적용됨: {appliedCoupon.description}</p>
              </div>
            )}
          </div>

          <div className="mb-4 rounded-lg bg-gray-50 p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-900">{selectedPlan.name}</p>
                <p className="text-sm text-gray-500">월 정기 구독</p>
              </div>
              <div className="text-right">
                {appliedCoupon && (
                  <p className="text-sm text-gray-400 line-through">{selectedPlan.price.toLocaleString()}원</p>
                )}
                <p className="text-xl font-bold text-gray-900">
                  {getDisplayPrice(selectedPlan.price) === 0 ? '첫 달 무료' : `${getDisplayPrice(selectedPlan.price).toLocaleString()}원`}
                </p>
                {appliedCoupon && !appliedCoupon.firstMonthFree && (
                  <p className="text-xs text-green-600">10% 할인 적용</p>
                )}
                {appliedCoupon?.firstMonthFree && (
                  <p className="text-xs text-green-600">다음 달부터 {Math.round(selectedPlan.price * 0.9).toLocaleString()}원/월</p>
                )}
              </div>
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
            {isLoading ? '결제 페이지로 이동 중...' : appliedCoupon?.firstMonthFree ? '무료로 시작하기' : `${getDisplayPrice(selectedPlan.price).toLocaleString()}원 결제하기`}
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
