import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "블로그 라이터 | 뷰티샵 블로그 글쓰기 도구",
  description: "뷰티샵 원장님을 위한 AI 블로그 글쓰기. 규칙은 시스템이 책임집니다.",
  keywords: ["뷰티샵", "블로그", "글쓰기", "반영구", "두피", "눈썹", "마케팅"],
  icons: {
    icon: "/favicon.svg",
  },
  metadataBase: new URL("https://blogwriter.co.kr"),
  openGraph: {
    title: "블로그 라이터",
    description: "뷰티샵 원장님을 위한 AI 블로그 글쓰기",
    url: "https://blogwriter.co.kr",
    siteName: "블로그라이터",
    locale: "ko_KR",
    type: "website",
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
