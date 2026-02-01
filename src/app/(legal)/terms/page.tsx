import Link from 'next/link';

export const metadata = {
  title: '이용약관 | 블로그라이터',
  description: '블로그라이터 서비스 이용약관',
};

export default function TermsPage() {
  return (
    <div className="min-h-dvh bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <Link href="/" className="text-sm text-blue-600 hover:underline mb-6 inline-block">
          ← 홈으로 돌아가기
        </Link>

        <h1 className="text-2xl font-bold text-slate-900 mb-8">이용약관</h1>

        <div className="bg-white rounded-2xl border p-6 sm:p-8 space-y-8 text-sm text-slate-700 leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">제1조 (목적)</h2>
            <p>
              본 약관은 블로그라이터(이하 "회사")가 제공하는 블로그 글 생성 서비스(이하 "서비스")의
              이용조건 및 절차, 회사와 이용자의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">제2조 (정의)</h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>"서비스"란 회사가 제공하는 AI 기반 블로그 글 생성 서비스를 말합니다.</li>
              <li>"이용자"란 본 약관에 동의하고 서비스를 이용하는 자를 말합니다.</li>
              <li>"콘텐츠"란 서비스를 통해 생성된 모든 텍스트를 말합니다.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">제3조 (약관의 효력 및 변경)</h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>본 약관은 서비스 화면에 게시하거나 기타의 방법으로 이용자에게 공지함으로써 효력이 발생합니다.</li>
              <li>회사는 필요한 경우 약관을 변경할 수 있으며, 변경된 약관은 공지 후 효력이 발생합니다.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">제4조 (서비스 이용)</h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>서비스는 회원가입 후 이용 가능합니다.</li>
              <li>무료 플랜은 1일 3회 글 생성이 가능합니다.</li>
              <li>유료 플랜(프로)은 월 구독 결제 후 무제한 글 생성이 가능합니다.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">제5조 (결제 및 환불)</h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>유료 서비스는 월 정기결제 방식으로 제공됩니다.</li>
              <li>결제일로부터 7일 이내 서비스 미사용 시 전액 환불이 가능합니다.</li>
              <li>결제일로부터 7일 이후 또는 서비스 사용 시에는 환불이 불가합니다.</li>
              <li>구독 취소는 언제든 가능하며, 취소 시 다음 결제일부터 서비스가 중단됩니다.</li>
              <li>환불 요청은 고객센터(wldms706@naver.com)로 문의해 주세요.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">제6조 (이용자의 의무)</h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>이용자는 서비스를 통해 생성된 콘텐츠에 대한 책임을 집니다.</li>
              <li>이용자는 타인의 권리를 침해하거나 법령에 위반되는 용도로 서비스를 이용할 수 없습니다.</li>
              <li>이용자는 서비스의 안정적 운영을 방해하는 행위를 하여서는 안 됩니다.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">제7조 (회사의 의무)</h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>회사는 안정적인 서비스 제공을 위해 최선을 다합니다.</li>
              <li>회사는 이용자의 개인정보를 보호하기 위해 노력합니다.</li>
              <li>회사는 서비스 장애 발생 시 신속하게 복구하기 위해 노력합니다.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">제8조 (서비스 중단)</h2>
            <p>
              회사는 시스템 점검, 장비 교체, 천재지변 등의 사유로 서비스를 일시 중단할 수 있으며,
              이 경우 사전에 공지합니다. 단, 긴급한 경우 사후에 공지할 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">제9조 (면책조항)</h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>회사는 AI가 생성한 콘텐츠의 정확성, 완전성을 보장하지 않습니다.</li>
              <li>이용자는 생성된 콘텐츠를 게시하기 전 검토할 책임이 있습니다.</li>
              <li>회사는 이용자가 생성된 콘텐츠를 사용하여 발생한 문제에 대해 책임지지 않습니다.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">제10조 (분쟁해결)</h2>
            <p>
              본 약관과 관련된 분쟁에 대해서는 대한민국 법률을 적용하며,
              분쟁 발생 시 회사 소재지 관할 법원을 전속관할로 합니다.
            </p>
          </section>

          <section className="pt-4 border-t">
            <p className="text-slate-500">
              시행일: 2026년 2월 1일
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
