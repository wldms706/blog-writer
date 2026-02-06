'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function SubscribeFailPage() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code');
  const message = searchParams.get('message');

  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-slate-900 mb-2">결제 실패</h1>
      <p className="text-slate-600 mb-2">
        결제 처리 중 문제가 발생했습니다.
      </p>
      {message && (
        <p className="text-sm text-slate-500 mb-6">
          사유: {message}
          {code && <span className="text-slate-400"> ({code})</span>}
        </p>
      )}
      <div className="space-y-3">
        <Link
          href="/subscribe"
          className="block w-full rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700"
        >
          다시 시도하기
        </Link>
        <Link
          href="/"
          className="block w-full rounded-lg bg-slate-100 px-6 py-3 text-sm font-medium text-slate-700 hover:bg-slate-200"
        >
          홈으로 돌아가기
        </Link>
      </div>

      <div className="mt-8 p-4 bg-slate-50 rounded-xl text-left">
        <h3 className="text-sm font-medium text-slate-900 mb-2">자주 발생하는 문제</h3>
        <ul className="text-sm text-slate-600 space-y-1">
          <li>• 카드 잔액이 부족한 경우</li>
          <li>• 카드 한도가 초과된 경우</li>
          <li>• 카드사 점검 시간인 경우</li>
          <li>• 해외 결제가 차단된 경우</li>
        </ul>
        <p className="mt-3 text-xs text-slate-500">
          문제가 지속되면 wldms706@naver.com으로 문의해주세요.
        </p>
      </div>
    </div>
  );
}
