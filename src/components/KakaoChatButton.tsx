'use client';

export default function KakaoChatButton() {
  return (
    <a
      href="http://pf.kakao.com/_yCZQn/chat"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#FEE500] text-[#000000]/85 px-4 py-3 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all font-bold text-sm"
    >
      <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
        <path fillRule="evenodd" clipRule="evenodd" d="M9 0.5C4.029 0.5 0 3.591 0 7.415c0 2.487 1.679 4.665 4.196 5.876-.136.479-.876 3.078-.907 3.291 0 0-.018.152.08.21.098.058.214.013.214.013.282-.04 3.269-2.14 3.783-2.5.538.076 1.093.116 1.634.116 4.971 0 9-3.091 9-6.915S13.971 0.5 9 0.5" fill="#000000"/>
      </svg>
      문의하기
    </a>
  );
}
