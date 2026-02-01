import Link from 'next/link';

export const metadata = {
  title: '개인정보처리방침 | 블로그라이터',
  description: '블로그라이터 개인정보처리방침',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-dvh bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <Link href="/" className="text-sm text-blue-600 hover:underline mb-6 inline-block">
          ← 홈으로 돌아가기
        </Link>

        <h1 className="text-2xl font-bold text-slate-900 mb-8">개인정보처리방침</h1>

        <div className="bg-white rounded-2xl border p-6 sm:p-8 space-y-8 text-sm text-slate-700 leading-relaxed">
          <section>
            <p className="mb-4">
              블로그라이터(이하 "회사")는 이용자의 개인정보를 중요시하며, 「개인정보 보호법」을 준수하고 있습니다.
              회사는 개인정보처리방침을 통하여 이용자가 제공하는 개인정보가 어떠한 용도와 방식으로 이용되고 있으며,
              개인정보보호를 위해 어떠한 조치가 취해지고 있는지 알려드립니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">1. 수집하는 개인정보 항목</h2>
            <p className="mb-2">회사는 서비스 제공을 위해 다음과 같은 개인정보를 수집합니다.</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>필수항목: 이메일 주소, 소셜 로그인 식별정보(카카오/Google)</li>
              <li>선택항목: 샵 위치(시/구/동), 블로그 URL</li>
              <li>자동수집항목: 서비스 이용기록, 접속 로그, 접속 IP 정보</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">2. 개인정보의 수집 및 이용목적</h2>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>서비스 제공: 블로그 글 생성, AI 키워드 추천, 맞춤 콘텐츠 제공</li>
              <li>회원 관리: 회원제 서비스 이용, 본인 확인, 서비스 부정이용 방지</li>
              <li>결제 및 정산: 유료 서비스 결제 처리, 환불 처리</li>
              <li>서비스 개선: 서비스 이용 통계 분석, 서비스 품질 개선</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">3. 개인정보의 보유 및 이용기간</h2>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>회원 탈퇴 시까지 (탈퇴 후 즉시 파기)</li>
              <li>단, 관계법령에 따라 보존이 필요한 경우 해당 기간 동안 보관</li>
              <li>전자상거래법에 따른 계약/청약철회 기록: 5년</li>
              <li>전자상거래법에 따른 대금결제 및 재화공급 기록: 5년</li>
              <li>전자상거래법에 따른 소비자 불만/분쟁처리 기록: 3년</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">4. 개인정보의 제3자 제공</h2>
            <p>
              회사는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다.
              다만, 아래의 경우에는 예외로 합니다.
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
              <li>이용자가 사전에 동의한 경우</li>
              <li>법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 요청이 있는 경우</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">5. 개인정보처리의 위탁</h2>
            <p className="mb-2">회사는 서비스 제공을 위해 다음과 같이 개인정보 처리를 위탁하고 있습니다.</p>
            <div className="overflow-x-auto">
              <table className="w-full border text-xs mt-2">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="border px-3 py-2 text-left">수탁업체</th>
                    <th className="border px-3 py-2 text-left">위탁업무</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border px-3 py-2">Supabase</td>
                    <td className="border px-3 py-2">데이터베이스 호스팅, 회원 인증</td>
                  </tr>
                  <tr>
                    <td className="border px-3 py-2">Vercel</td>
                    <td className="border px-3 py-2">웹 서비스 호스팅</td>
                  </tr>
                  <tr>
                    <td className="border px-3 py-2">페이플</td>
                    <td className="border px-3 py-2">결제 처리</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">6. 이용자의 권리</h2>
            <p className="mb-2">이용자는 언제든지 다음과 같은 권리를 행사할 수 있습니다.</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>개인정보 열람 요구</li>
              <li>오류 등이 있을 경우 정정 요구</li>
              <li>삭제 요구</li>
              <li>처리정지 요구</li>
            </ul>
            <p className="mt-2">
              권리 행사는 설정 페이지 또는 고객센터(wldms706@naver.com)를 통해 요청하실 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">7. 개인정보의 파기</h2>
            <p>
              회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는
              지체없이 해당 개인정보를 파기합니다. 전자적 파일 형태의 정보는 복구할 수 없는 방법으로 파기하고,
              종이에 출력된 개인정보는 분쇄기로 분쇄하거나 소각합니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">8. 개인정보 보호책임자</h2>
            <ul className="list-none space-y-1">
              <li>담당자: 정지은</li>
              <li>이메일: wldms706@naver.com</li>
              <li>연락처: 010-3757-3918</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">9. 개인정보처리방침 변경</h2>
            <p>
              이 개인정보처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는
              변경사항의 시행 7일 전부터 공지사항을 통하여 고지합니다.
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
