import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { Logo } from "@/components/brand/logo";
import { HeroParallax } from "@/components/landing/hero-parallax";
import { GuestAuthButtons } from "@/components/layout/guest-auth-buttons";
import { IconChevronRight, IconPaddle, IconPin, IconTrophy } from "@/components/ui/icons";
import { SUPPORT_URL } from "@/lib/links";

export const metadata = {
  alternates: { canonical: "/" },
};

const FEATURES: {
  href: string;
  icon: ReactNode;
  title: string;
  desc: string;
}[] = [
  {
    href: "/games",
    icon: <IconPaddle size={24} />,
    title: "Игры и спарринги",
    desc: "Записывайся в один тап",
  },
  {
    href: "/venues",
    icon: <IconPin size={24} />,
    title: "Залы",
    desc: "Столы, цены, часы работы и отзывы",
  },
  {
    href: "/tournaments",
    icon: <IconTrophy size={24} />,
    title: "Турниры",
    desc: "Регистрация и регламент онлайн",
  },
];

export default async function LandingPage() {
  const hasSession = (await cookies()).get("has_session")?.value === "1";
  if (hasSession) redirect("/games");

  return (
    <div className="relative min-h-screen bg-surface">
      <HeroParallax />
      <header className="sticky top-0 z-40 border-b border-border bg-surface/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1160px] items-center justify-between gap-4 px-5">
          <Link href="/" aria-label="pingup">
            <Logo className="h-9" />
          </Link>
          <div className="flex items-center gap-2">
            <GuestAuthButtons />
          </div>
        </div>
      </header>

      <section className="relative">
        <div className="relative mx-auto max-w-[1160px] px-5 pt-12 sm:pt-20">
          <h1 className="mt-4 max-w-[760px] text-[32px] leading-[1.04] font-extrabold tracking-[-0.02em] text-balance sm:text-[54px]">
            Найди игру за пару минут
          </h1>
          <p className="mt-4 mb-7 max-w-[560px] text-[15px] leading-relaxed text-fg-2 sm:text-lg">
            Собираем напарников, залы, тренировки и турниры Смоленска в одном месте
          </p>
          <Link
            href="/games"
            className="inline-flex h-[52px] items-center gap-2 rounded bg-primary px-6 text-[15px] font-bold text-white shadow-card transition-colors hover:bg-primary-600"
          >
            Смотреть игры
            <IconChevronRight size={17} />
          </Link>
        </div>

        <div className="relative mx-auto grid max-w-[1160px] gap-4 px-5 pt-12 pb-2 sm:grid-cols-3 sm:pt-16">
          {FEATURES.map((f) => (
            <Link
              key={f.href}
              href={f.href}
              className="group flex flex-col rounded-lg border border-border bg-surface p-[22px] shadow-card transition hover:-translate-y-0.5 hover:shadow-pop"
            >
              <div className="mb-3.5 flex size-11 items-center justify-center rounded-xl bg-primary-tint text-primary">
                {f.icon}
              </div>
              <h3 className="mb-1.5 text-lg font-extrabold">{f.title}</h3>
              <div className="text-sm leading-normal text-muted">{f.desc}</div>
              <span className="mt-auto inline-flex items-center pt-5 text-primary">
                <IconChevronRight size={18} className="transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="relative mx-auto max-w-[1160px] px-5 pt-10 pb-14">
        <div className="flex flex-wrap items-center justify-between gap-5 rounded-lg bg-fg p-[34px]">
          <div>
            <h2 className="mb-1.5 text-[22px] font-extrabold text-white">Готов выйти к столу?</h2>
            <div className="text-[14.5px] text-white/70">
              Зарегистрируйся, заполни профиль — и найди игру рядом
            </div>
          </div>
          <Link
            href="/register"
            className="flex h-12 items-center rounded bg-primary px-[22px] text-[15px] font-bold text-white hover:bg-primary-600"
          >
            Создать аккаунт
          </Link>
        </div>
      </section>

      <footer className="relative border-t border-border bg-surface">
        <div className="mx-auto flex max-w-[1160px] flex-wrap items-center justify-between gap-3.5 px-5 py-[26px]">
          <div className="flex items-center gap-2.5">
            <Logo variant="mark" className="h-9" />
            <span className="text-[13px] text-muted">© 2026 pingup · Смоленск</span>
          </div>
          <div className="flex gap-[18px] text-[13px] text-muted">
            <a
              href={SUPPORT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary"
            >
              Поддержка
            </a>
            <Link href="/legal/terms" className="hover:text-primary">
              Пользовательское соглашение
            </Link>
            <Link href="/legal/privacy" className="hover:text-primary">
              Конфиденциальность
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
