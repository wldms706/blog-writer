'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SubscribeSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const confirmPayment = async () => {
      const paymentKey = searchParams.get('paymentKey');
      const orderId = searchParams.get('orderId');
      const amount = searchParams.get('amount');
      const planId = searchParams.get('planId');

      if (!paymentKey || !orderId || !amount) {
        setError('결제 정보가 올바르지 않습니다.');
        setIsProcessing(false);
        return;
      }

      try {
        const response = await fetch('/api/payments/confirm', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentKey,
            orderId,
            amount: Number(amount),
            planId,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || '결제 확인에 실패했습니다.');
        }

        setIsProcessing(false);
      } catch (err) {
        console.error('결제 확인 오류:', err);
        setError(err instanceof Error ? err.message : '결제 확인 중 오류가 발생했습니다.');
        setIsProcessing(false);
      }
    };

    confirmPayment();
  }, [searchParams]);

  if (isProcessing) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-6" />
        <h1 className="text-xl font-semibold text-slate-900 mb-2">결제 확인 중...</h1>
        <p className="text-slate-600">잠시만 기다려주세요.</p>
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
        <h1 className="text-xl font-semibold text-slate-900 mb-2">결제 확인 실패</h1>
        <p className="text-slate-600 mb-6">{error}</p>
        <Link
          href="/subscribe"
          className="inline-block rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
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
      <h1 className="text-2xl font-bold text-slate-900 mb-2">구독 완료!</h1>
      <p className="text-slate-600 mb-8">
        프로 플랜이 활성화되었습니다.<br />
        이제 무제한으로 블로그 글을 생성할 수 있습니다.
      </p>
      <div className="space-y-3">
        <Link
          href="/"
          className="block w-full rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700"
        >
          글 작성하러 가기
        </Link>
        <Link
          href="/settings"
          className="block w-full rounded-lg bg-slate-100 px-6 py-3 text-sm font-medium text-slate-700 hover:bg-slate-200"
        >
          구독 관리
        </Link>
      </div>
    </div>
  );
}
