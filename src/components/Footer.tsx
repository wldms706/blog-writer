import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t bg-white mt-auto">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* 사업자 정보 */}
          <div className="text-xs text-slate-500 space-y-1">
            <p className="font-semibold text-slate-700 mb-2">사업자 정보</p>
            <p>상호명: 블로그라이터</p>
            <p>대표자명: 정지은</p>
            <p>사업자등록번호: 542-02-03878</p>
            <p>주소: 충청남도 천안시 동남구 풍세면 풍세산단로 290, 104동 504호</p>
            <p>전화번호: 010-3757-3918</p>
            <p>이메일: wldms706@naver.com</p>
          </div>

          {/* 고객 지원 */}
          <div className="text-xs text-slate-500 space-y-1">
            <p className="font-semibold text-slate-700 mb-2">고객 지원</p>
            <p>평일 10:00 - 18:00 (주말 및 공휴일 휴무)</p>
            <p>이메일: betterjung706@gmail.com</p>
            <p>카카오톡: 찐이지 뷰티샵 비즈니스 코치</p>
          </div>
        </div>

        {/* 링크 */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap gap-4 text-xs">
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
