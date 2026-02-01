import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t bg-white mt-auto">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* 사업자 정보 */}
        <div className="text-xs text-slate-500 space-y-1">
          <p className="font-medium text-slate-700">블로그라이터</p>
          <p>대표: 정지은 | 사업자등록번호: 542-02-03878</p>
          <p>주소: 충청남도 천안시 동남구 풍세면 풍세산단로 290, 104동 504호(천안한양수자인에코시티)</p>
          <p>이메일: wldms706@naver.com | 고객센터: 010-3757-3918</p>
        </div>

        {/* 링크 */}
        <div className="mt-4 flex flex-wrap gap-4 text-xs">
          <Link href="/terms" className="text-slate-500 hover:text-slate-700 hover:underline">
            이용약관
          </Link>
          <Link href="/privacy" className="text-slate-500 hover:text-slate-700 hover:underline">
            개인정보처리방침
          </Link>
        </div>

        {/* 저작권 */}
        <p className="mt-4 text-[11px] text-slate-400">
          © 2026 블로그라이터. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
