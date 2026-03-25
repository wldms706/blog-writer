import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import KakaoChatButton from "@/components/KakaoChatButton";

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
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "블로그 라이터",
      },
    ],
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&display=swap"
          rel="stylesheet"
        />
      </head>
      <Script
        id="fb-pixel"
        strategy="lazyOnload"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '4173851432877980');
            fbq('track', 'PageView');
          `,
        }}
      />
      <body className="antialiased">
        {children}
        <KakaoChatButton />
      </body>
    </html>
  );
}
