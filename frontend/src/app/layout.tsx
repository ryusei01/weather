import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import KeepAlive from "./components/KeepAlive";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),
  title: "1年前の気温 - 今日と過去の気温を比較",
  description:
    "今日の天気・気温と1年前、10年前、20年前、30年前、40年前の気温・天気を比較できます。東京の過去の気温データを確認して、気候変動を実感しよう。",
  keywords: [
    "天気",
    "気温",
    "過去の気温",
    "1年前の気温",
    "1年前の今日の気温",
    "10年前の気温",
    "10年前の今日の気温",
    "20年前の気温",
    "20年前の今日の気温",
    "30年前の気温",
    "30年前の今日の気温",
    "40年前の気温",
    "40年前の今日の気温",
    "気温比較",
    "東京の天気",
    "気象データ",
    "気候変動",
    "温暖化",
    "本当に温暖化",
  ],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "1年前の気温 - 今日と過去の気温を比較",
    description:
      "今日の天気・気温と過去の気温を簡単に比較。1年前の気温から40年前の気温までの気温データを比較できます。",
    type: "website",
    locale: "ja_JP",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "天気比較 - 過去の気温データ比較サービス",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "1年前の気温 - 今日と過去の気温を比較",
    description:
      "今日の天気・気温と過去の気温を簡単に比較。1年前の気温から40年前の気温までの気温データを比較できます。",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        {/* Google Analytics */}
        <Script
          strategy="beforeInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-XYTY2SKLR4"
        />
        <Script
          id="google-analytics"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-XYTY2SKLR4');
            `,
          }}
        />
        {/* Google AdSense */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4514405692142768"
          crossOrigin="anonymous"
          strategy="beforeInteractive"
        />
        {/* JSON-LD Structured Data */}
        <Script
          id="json-ld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "天気比較",
              description:
                "今日の天気と1年前の気温、10年前の気温、20年前の気温、30年前の気温、40年前の気温・天気を比較できます。東京の過去の気温データを確認して、気候変動を実感しよう。",
              url: "https://weather-ten-gamma-42.vercel.app/",
              applicationCategory: "UtilityApplication",
              operatingSystem: "Any",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "JPY",
              },
              inLanguage: "ja",
              author: {
                "@type": "Organization",
                name: "天気比較",
              },
            }),
          }}
        />
      </head>
      <body className={inter.className}>
        <KeepAlive />
        {children}
      </body>
    </html>
  );
}
