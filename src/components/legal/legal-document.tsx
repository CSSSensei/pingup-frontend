import Link from "next/link";
import type { ReactNode } from "react";

import { Logo } from "@/components/brand/logo";
import { IconChevronLeft } from "@/components/ui/icons";

export function LegalDocument({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface-2">
      <header className="sticky top-0 z-40 border-b border-border bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[820px] items-center justify-between gap-4 px-5">
          <Link href="/" aria-label="pingup">
            <Logo className="h-[26px]" />
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1 text-sm font-bold text-fg-2 hover:text-primary"
          >
            <IconChevronLeft size={16} />
            На главную
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-[820px] px-5 py-10">
        <article className="rounded-lg border border-border bg-surface p-6 shadow-card sm:p-10">
          <h1 className="text-[26px] font-extrabold tracking-[-0.01em] sm:text-[32px]">{title}</h1>
          <p className="mt-2 mb-8 text-sm text-muted">Последнее обновление: {updated}</p>
          <div className="text-[15px] leading-relaxed text-fg-2 [&_a]:font-medium [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:text-[17px] [&_h2]:font-extrabold [&_h2]:text-fg [&_h3]:mt-5 [&_h3]:mb-2 [&_h3]:font-bold [&_h3]:text-fg [&_li]:mb-1.5 [&_ol]:mb-3.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-3.5 [&_strong]:font-semibold [&_strong]:text-fg [&_ul]:mb-3.5 [&_ul]:list-disc [&_ul]:pl-5">
            {children}
          </div>
        </article>
      </main>
    </div>
  );
}
