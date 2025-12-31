import type { Metadata } from "next";
import { Geist, Geist_Mono, Zhi_Mang_Xing } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const zhiMangXing = Zhi_Mang_Xing({
  weight: "400",
  variable: "--font-zhi-mang-xing",
  subsets: ["latin"],
  preload: false,
});

import { Noto_Sans_TC } from "next/font/google";

const notoSansTC = Noto_Sans_TC({
  variable: "--font-noto-sans-tc",
  subsets: ["latin"],
  preload: false,
});

export const metadata: Metadata = {
  title: "Annual Review 2024",
  description: "A warm review of 2024 and wishes for 2025",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${zhiMangXing.variable} ${notoSansTC.variable} antialiased`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
