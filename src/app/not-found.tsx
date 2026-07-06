import type { Metadata } from "next";
import Link from "next/link";

import { Logo } from "@/components/brand/logo";
import { OutBallScene } from "@/components/brand/out-ball-scene";
import { IconArrowLeft, IconChevronRight, IconPaddle, IconPin, IconTrophy } from "@/components/ui/icons";
import { LinkButton } from "@/components/ui/link-button";

export const metadata: Metadata = {
  title: "Страница не найдена",
};

const POPULAR = [
  { href: "/venues", label: "Залы", icon: IconPin },
  { href: "/games", label: "Игры", icon: IconPaddle },
  { href: "/tournaments", label: "Турниры", icon: IconTrophy },
];

const ballBg = "bg-[radial-gradient(circle_at_35%_30%,#fff,#e2e2e2_52%,#ababab)]";

export default function NotFound() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-surface">
      <div
        aria-hidden
        className={`pointer-events-none absolute -top-[120px] -left-[110px] size-[360px] rounded-full opacity-40 blur-[2px] ${ballBg}`}
      />
      <div
        aria-hidden
        className={`pointer-events-none absolute -right-[90px] -bottom-[150px] size-[300px] rounded-full opacity-30 blur-[2px] ${ballBg}`}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(10,10,10,0.045))]"
      />

      <header className="relative z-10 mx-auto flex h-16 max-w-[1160px] items-center px-5">
        <Link href="/" aria-label="pingUp">
          <Logo className="h-[26px]" />
        </Link>
      </header>

      <section className="relative z-10 mx-auto flex max-w-[680px] flex-col items-center px-5 pt-2 pb-24 text-center sm:pt-6">
        <div className="pu-reveal w-full">
          <OutBallScene />
        </div>

        <span
          className="pu-reveal mt-8 inline-flex items-center gap-2 rounded-pill border border-border bg-surface px-3.5 py-1.5 text-[12px] font-bold tracking-wide text-muted uppercase shadow-card"
          style={{ animationDelay: "60ms" }}
        >
          <span className={`size-2 rounded-full ${ballBg}`} />
          Ошибка 404
        </span>

        <h1
          className="pu-reveal mt-5 text-[clamp(2rem,6vw,3.25rem)] leading-[1.05] font-extrabold tracking-[-0.02em] text-balance"
          style={{ animationDelay: "120ms" }}
        >
          Страница не найдена
        </h1>

        <p
          className="pu-reveal mt-4 max-w-[440px] text-[15px] leading-relaxed text-fg-2 text-balance sm:text-base"
          style={{ animationDelay: "180ms" }}
        >
          Возможно, ссылка устарела или в адресе есть опечатка.
        </p>

        <div
          className="pu-reveal mt-7 flex w-full justify-center sm:w-auto"
          style={{ animationDelay: "240ms" }}
        >
          <LinkButton href="/" size="lg" fullWidth className="sm:w-auto">
            <IconArrowLeft size={18} />
            На главную
          </LinkButton>
        </div>

        <div
          className="pu-reveal mt-9 flex flex-col items-center gap-3"
          style={{ animationDelay: "300ms" }}
        >
          <span className="text-[13px] font-semibold text-muted">Может быть, вы искали:</span>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {POPULAR.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="group inline-flex items-center gap-1.5 rounded-pill border border-border bg-surface px-3.5 py-2 text-[13.5px] font-bold text-fg-2 shadow-card transition-colors hover:border-primary hover:text-primary"
              >
                <Icon size={16} />
                {label}
                <IconChevronRight
                  size={15}
                  className="text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
