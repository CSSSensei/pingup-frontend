import type { Metadata } from "next";
import type { ReactNode } from "react";

import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "pingUp — поиск напарника по настольному теннису",
    template: "%s · pingUp",
  },
  description:
    "pingUp — найди напарника, зал, турнир и тренировку по настольному теннису в Смоленске.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
