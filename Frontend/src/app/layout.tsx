/**
 * Frontend 애플리케이션의 루트 레이아웃입니다.
 * 전역 폰트 설정, 메타데이터 정의 및 Provider들을 감쌉니다.
 */
import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import localFont from "next/font/local";
import "../styles/globals.css";
import { Providers } from "./providers";

const nanumSquareRound = localFont({
  src: [
    {
      path: "../../public/fonts/NanumSquareRoundL.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/fonts/NanumSquareRoundR.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/NanumSquareRoundB.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../public/fonts/NanumSquareRoundEB.ttf",
      weight: "800",
      style: "normal",
    },
  ],
  variable: "--font-nanum",
});

const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "TailLog - 반려견 행동 분석 & 훈련 솔루션",
  description:
    "AI가 분석하는 우리 강아지 맞춤 행동 교정 서비스",
  manifest: "/manifest.json",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.mungai.co.kr"
  ),
  openGraph: {
    title: "TailLog - AI 기반 반려견 행동 분석 & 맞춤 솔루션",
    description:
      "반려견의 문제 행동을 기록하고 분석하여 맞춤형 훈련 솔루션을 받아보세요.",
    images: [
      {
        url: "/preview.png",
        width: 1200,
        height: 630,
        alt: "TailLog 공유 이미지",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TailLog - AI 기반 반려견 행동 분석 & 맞춤 솔루션",
    description:
      "반려견의 문제 행동을 기록하고 분석하여 맞춤형 훈련 솔루션을 받아보세요.",
    images: ["/preview.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${nanumSquareRound.variable} ${outfit.variable} font-nanum bg-gray-50 text-slate-800 antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
