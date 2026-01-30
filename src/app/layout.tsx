import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "블로그 라이터 | 뷰티샵 블로그 글쓰기 도구",
  description: "시술자 사고에서 벗어나 신고 없이 신뢰를 쌓는 블로그 글을 쓰도록 도와주는 도구입니다.",
  keywords: ["뷰티샵", "블로그", "글쓰기", "반영구", "두피", "눈썹", "마케팅"],
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          as="style"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
