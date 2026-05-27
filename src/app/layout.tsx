import type { Metadata } from "next";
import { Gowun_Batang, IBM_Plex_Sans_KR } from "next/font/google";
import "./globals.css";

const bodyFont = IBM_Plex_Sans_KR({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const displayFont = Gowun_Batang({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "원자 안정성 시뮬레이터 | Atomic Stability Survival",
  description:
    "실제 동위원소 안정성 데이터를 기반으로 원자를 구성하고 생존 시간을 측정하는 시뮬레이터.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${bodyFont.variable} ${displayFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100">
        {children}
      </body>
    </html>
  );
}
