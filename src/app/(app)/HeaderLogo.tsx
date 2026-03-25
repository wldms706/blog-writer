'use client';

export default function HeaderLogo() {
  const handleClick = () => {
    // 전체 페이지 새로고침으로 폼 상태 초기화
    window.location.href = '/';
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
    >
      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-[#3B5CFF]">
        <span className="text-sm font-black text-white">찐</span>
      </div>
      <div className="leading-tight text-left">
        <div className="text-sm font-black text-white whitespace-nowrap">블로그 라이터</div>
        <div className="hidden sm:block text-[11px] text-white/40">규칙은 시스템이 책임집니다</div>
      </div>
    </button>
  );
}
