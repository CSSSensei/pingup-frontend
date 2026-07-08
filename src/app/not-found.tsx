import type { Metadata } from "next";
import Link from "next/link";

import { Logo } from "@/components/brand/logo";
import { OutBallScene } from "@/components/brand/out-ball-scene";
import { IconArrowLeft } from "@/components/ui/icons";
import { LinkButton } from "@/components/ui/link-button";

export const metadata: Metadata = {
  title: "Страница не найдена",
};

export default function NotFound() {
  return (
    <main className="relative min-h-screen bg-surface">
      <header className="mx-auto flex h-16 max-w-[1320px] items-center px-5">
        <Link href="/" aria-label="pingup">
          <Logo className="h-9" />
        </Link>
      </header>

      <section className="mx-auto flex max-w-[680px] flex-col items-center px-5 pt-2 pb-24 text-center sm:pt-6">
        <div className="w-full">
          <OutBallScene />
        </div>

        <h1 className="mt-5 text-[clamp(2rem,6vw,3.25rem)] leading-[1.05] font-extrabold tracking-[-0.02em] text-balance">
          Страница не найдена
        </h1>

        <p className="mt-4 max-w-[440px] text-[15px] leading-relaxed text-fg-2 text-balance sm:text-base">
          Возможно, ссылка устарела или в адресе есть опечатка.
        </p>

        <div className="mt-7 flex w-full justify-center sm:w-auto">
          <LinkButton href="/" size="lg" fullWidth className="sm:w-auto">
            <IconArrowLeft size={18} />
            На главную
          </LinkButton>
        </div>
      </section>
    </main>
  );
}
