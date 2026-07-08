import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import { YandexMetrika } from "@/components/analytics/yandex-metrika";
import { CookieConsentBanner } from "@/components/layout/cookie-consent-banner";
import { SITE_URL } from "@/lib/site";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "pingup — поиск напарника по настольному теннису",
    template: "%s · pingup",
  },
  description:
    "pingup — найди напарника, зал, турнир и тренировку по настольному теннису в Смоленске.",
};

export const viewport: Viewport = {
  themeColor: "#1c5fd0",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
        <CookieConsentBanner />
        <YandexMetrika />
      </body>
    </html>
  );
}
