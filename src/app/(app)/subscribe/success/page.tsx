'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function SubscribeSuccessPage() {
  const searchParams = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const issueBillingKey = async () => {
      const authKey = searchParams.get('authKey');
      const customerKey = searchParams.get('customerKey');
      const planId = searchParams.get('planId');
      const coupon = searchParams.get('coupon');

      if (!authKey || !customerKey) {
        setError('카드 등록 정보가 올바르지 않습니다.');
        setIsProcessing(false);
        return;
      }

      try {
        const response = await fetch('/api/payments/billing-issue', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ authKey, customerKey, planId, coupon }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || '구독 처리에 실패했습니다.');
        }

        setIsProcessing(false);
      } catch (err) {
        console.error('구독 처리 오류:', err);
        setError(err instanceof Error ? err.message : '구독 처리 중 오류가 발생했습니다.');
        setIsProcessing(false);
      }
    };

    issueBillingKey();
  }, [searchParams]);

  if (isProcessing) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <div className="animate-spin w-12 h-12 border-4 border-[#3B5CFF] border-t-transparent rounded-full mx-auto mb-6" />
        <h1 className="text-xl font-semibold text-gray-900 mb-2">구독 처리 중...</h1>
        <p className="text-gray-600">카드 등록 및 첫 결제를 진행하고 있습니다.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">구독 실패</h1>
        <p className="text-gray-600 mb-6">{error}</p>
        <Link
          href="/subscribe"
          className="inline-block rounded-full bg-[#3B5CFF] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#2A45E0]"
        >
          다시 시도하기
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">구독 시작!</h1>
      <p className="text-gray-600 mb-8">
        프로 플랜이 활성화되었습니다.<br />
        매월 자동으로 결제되며, 설정에서 언제든 해지할 수 있습니다.
      </p>
      <div className="space-y-3">
        <Link
          href="/write"
          className="block w-full rounded-full bg-[#3B5CFF] px-6 py-3 text-sm font-bold text-white hover:bg-[#2A45E0]"
        >
          글 작성하러 가기
        </Link>
        <Link
          href="/settings"
          className="block w-full rounded-full bg-gray-100 px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-200"
        >
          구독 관리
        </Link>
      </div>
    </div>
  );
}
