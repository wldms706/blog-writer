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

        <h1 className="text-2xl font-bold text-slate-900 mb-2">개인정보처리방침</h1>
        <p className="text-sm text-slate-500 mb-8">최종 수정일: 2026년 2월 1일</p>

        <div className="bg-white rounded-2xl border p-6 sm:p-8 space-y-8 text-sm text-slate-700 leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">제1조 (개인정보의 처리 목적)</h2>
            <p className="mb-4">
              블로그라이터(이하 &quot;회사&quot;)는 다음의 목적을 위하여 개인정보를 처리합니다.
              처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며,
              이용 목적이 변경되는 경우에는 개인정보 보호법 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
            </p>
            <div className="space-y-3">
              <div>
                <p className="font-medium text-slate-800">회원 가입 및 관리</p>
                <p className="text-slate-600">회원 가입의사 확인, 회원제 서비스 제공에 따른 본인 식별·인증, 회원자격 유지·관리, 서비스 부정이용 방지 목적으로 개인정보를 처리합니다.</p>
              </div>
              <div>
                <p className="font-medium text-slate-800">서비스 제공</p>
                <p className="text-slate-600">AI 기반 블로그 글 생성 서비스 제공, 맞춤형 콘텐츠 제공, 서비스 이용 기록 관리를 목적으로 개인정보를 처리합니다.</p>
              </div>
              <div>
                <p className="font-medium text-slate-800">고충처리</p>
                <p className="text-slate-600">민원인의 신원 확인, 민원사항 확인, 사실조사를 위한 연락·통지, 처리결과 통보 목적으로 개인정보를 처리합니다.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">제2조 (처리하는 개인정보의 항목)</h2>
            <p className="mb-3">회사는 다음의 개인정보 항목을 처리하고 있습니다:</p>
            <div className="space-y-3">
              <div>
                <p className="font-medium text-slate-800">1. 회원가입 및 관리</p>
                <ul className="list-disc list-inside space-y-1 ml-2 text-slate-600">
                  <li>필수항목: 이메일 주소, 소셜 로그인 식별정보(카카오/Google)</li>
                  <li>선택항목: 샵 위치(시/구/동), 블로그 URL</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-slate-800">2. 서비스 이용과정에서 자동으로 수집되는 정보</p>
                <ul className="list-disc list-inside space-y-1 ml-2 text-slate-600">
                  <li>IP 주소, 쿠키, 서비스 이용 기록, 접속 로그</li>
                  <li>기기 정보 (브라우저 유형, OS 버전)</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">제3조 (개인정보의 처리 및 보유기간)</h2>
            <p className="mb-3">
              회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.
            </p>
            <p className="mb-2">각각의 개인정보 처리 및 보유 기간은 다음과 같습니다:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>회원 정보: 회원 탈퇴 시까지 (단, 관련 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관)</li>
              <li>서비스 이용 기록: 3년 (통신비밀보호법)</li>
              <li>계약 또는 청약철회 기록: 5년 (전자상거래법)</li>
              <li>대금결제 및 재화공급 기록: 5년 (전자상거래법)</li>
              <li>소비자 불만/분쟁처리 기록: 3년 (전자상거래법)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">제4조 (개인정보의 제3자 제공)</h2>
            <p>
              회사는 정보주체의 개인정보를 제1조(개인정보의 처리 목적)에서 명시한 범위 내에서만 처리하며,
              정보주체의 동의, 법률의 특별한 규정 등 개인정보 보호법 제17조에 해당하는 경우에만 개인정보를 제3자에게 제공합니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">제5조 (개인정보처리의 위탁)</h2>
            <p className="mb-3">회사는 서비스 제공을 위해 다음과 같이 개인정보 처리를 위탁하고 있습니다:</p>
            <div className="overflow-x-auto">
              <table className="w-full border text-xs">
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
            <h2 className="text-lg font-semibold text-slate-900 mb-3">제6조 (개인정보의 파기)</h2>
            <p className="mb-3">
              회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체없이 해당 개인정보를 파기합니다.
            </p>
            <p className="mb-2">개인정보 파기의 절차 및 방법은 다음과 같습니다:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><span className="font-medium">파기절차:</span> 이용자가 입력한 정보는 목적 달성 후 별도의 DB에 옮겨져 내부 방침 및 기타 관련 법령에 따라 일정기간 저장된 후 혹은 즉시 파기됩니다.</li>
              <li><span className="font-medium">파기방법:</span> 전자적 파일 형태의 정보는 기록을 재생할 수 없는 기술적 방법을 사용합니다. 종이에 출력된 개인정보는 분쇄기로 분쇄하거나 소각을 통하여 파기합니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">제7조 (정보주체의 권리·의무 및 행사방법)</h2>
            <p className="mb-3">정보주체는 회사에 대해 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다:</p>
            <ul className="list-disc list-inside space-y-1 ml-2 mb-3">
              <li>개인정보 열람 요구</li>
              <li>오류 등이 있을 경우 정정 요구</li>
              <li>삭제 요구</li>
              <li>처리정지 요구</li>
            </ul>
            <p>
              권리 행사는 회사에 대해 서면, 전화, 전자우편 등을 통하여 하실 수 있으며, 회사는 이에 대해 지체없이 조치하겠습니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">제8조 (개인정보의 안전성 확보조치)</h2>
            <p className="mb-3">회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><span className="font-medium">관리적 조치:</span> 내부관리계획 수립·시행, 정기적 직원 교육</li>
              <li><span className="font-medium">기술적 조치:</span> 개인정보처리시스템 등의 접근권한 관리, 접근통제시스템 설치, 고유식별정보 등의 암호화, 보안프로그램 설치</li>
              <li><span className="font-medium">물리적 조치:</span> 전산실, 자료보관실 등의 접근통제</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">제9조 (개인정보 보호책임자)</h2>
            <p className="mb-3">
              회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다:
            </p>
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="font-medium text-slate-800 mb-2">개인정보 보호책임자</p>
              <ul className="list-none space-y-1 text-slate-600">
                <li>담당자: 정지은</li>
                <li>이메일: wldms706@naver.com</li>
                <li>연락처: 010-3757-3918</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">제10조 (개인정보 처리방침의 변경)</h2>
            <p>
              이 개인정보처리방침은 2026년 2월 1일부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는
              변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.
            </p>
          </section>

          <section className="pt-4 border-t">
            <Link href="/" className="text-blue-600 hover:underline text-sm">
              홈으로 돌아가기
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
