import Link from 'next/link';

export default function PricingNotice() {
  return (
    <aside aria-label="구독 요금 안내" className="mx-auto my-4 w-full max-w-5xl rounded-2xl border border-amber-300 bg-amber-50 p-4 sm:p-5 text-left text-gray-900">
      <h2 className="text-sm sm:text-base font-bold">선착순 100명 할인 종료 · 신규 구독 요금 안내</h2>
      <p className="mt-2 text-sm leading-relaxed">월 구독료는 프로(일반) 15,900원, 프로(반영구) 19,900원입니다. 인스타 캡션 단독은 월 2,900원으로 유지됩니다.</p>
      <p className="mt-2 text-xs sm:text-sm leading-relaxed text-gray-600">기존 구독의 자동결제는 등록된 구독 금액을 기준으로 진행됩니다. 구독 취소·환불 후 다시 구독하면 재구독 시점의 가격이 적용되며, 기존 할인 가격이 유지되지 않을 수 있습니다.</p>
      <Link href="/pricing" className="mt-3 inline-block text-sm font-semibold text-[#3B5CFF] underline underline-offset-2">요금 자세히 보기 →</Link>
    </aside>
  );
}
