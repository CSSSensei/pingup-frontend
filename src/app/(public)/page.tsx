import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { Logo } from "@/components/brand/logo";
import { HeroParallax } from "@/components/landing/hero-parallax";
import { SiteHeader } from "@/components/layout/site-header";
import {
  IconChevronRight,
  IconPaddle,
  IconPin,
  IconTrophy,
} from "@/components/ui/icons";
import { LinkButton } from "@/components/ui/link-button";
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
    <div className="relative flex min-h-dvh flex-col bg-surface">
      <HeroParallax />
      <SiteHeader authed={false} home="/" />

      <main className="flex-1">
        <section className="relative">
          <div className="relative mx-auto max-w-[1320px] px-5 pt-12 sm:pt-20">
            <h1 className="max-w-[760px] text-[32px] leading-[1.04] font-extrabold tracking-[-0.02em] text-balance sm:text-[54px]">
              Найди игру за пару минут
            </h1>
            <p className="mt-4 mb-7 max-w-[560px] text-[15px] leading-relaxed text-fg-2 sm:text-lg">
              Собираем напарников, залы, тренировки и турниры Смоленска в одном
              месте
            </p>
            <LinkButton href="/games" variant="primary" size="lg">
              Смотреть игры
              <IconChevronRight size={17} />
            </LinkButton>
          </div>

          <h2 className="sr-only">Возможности</h2>
          <div className="relative mx-auto grid max-w-[1320px] gap-4 px-5 pt-12 pb-2 sm:grid-cols-3 sm:pt-16">
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
                <div className="text-sm leading-normal text-muted">
                  {f.desc}
                </div>
                <span className="mt-auto inline-flex items-center pt-5 text-primary">
                  <IconChevronRight
                    size={18}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="relative mx-auto max-w-[1320px] px-5 pt-10 pb-14">
          <div className="flex flex-wrap items-center justify-between gap-5 rounded-lg bg-fg p-[34px]">
            <div>
              <h2 className="mb-1.5 text-[22px] font-extrabold text-white">
                Готов выйти к столу?
              </h2>
              <div className="text-sm text-white/70">
                Зарегистрируйся, заполни профиль — и найди игру рядом
              </div>
            </div>
            <LinkButton href="/register" variant="secondary" size="lg">
              Создать аккаунт
            </LinkButton>
          </div>
        </section>
      </main>

      <footer className="relative border-t border-border bg-surface">
        <div className="mx-auto flex max-w-[1320px] flex-col items-start gap-5 px-5 py-8 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-3.5 sm:py-[26px]">
          <div className="flex items-center gap-2.5">
            <Logo variant="mark" alt="" className="h-9" />
            <span className="text-[13px] text-muted">
              © 2026 pingup · Смоленск
            </span>
          </div>
          <div className="flex flex-wrap gap-x-[18px] gap-y-1 text-[13px] text-muted">
            <a
              href={SUPPORT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="-my-1 py-2 transition-colors hover:text-primary"
            >
              Поддержка
            </a>
            <Link
              href="/legal/terms"
              className="-my-1 py-2 transition-colors hover:text-primary"
            >
              Пользовательское соглашение
            </Link>
            <Link
              href="/legal/privacy"
              className="-my-1 py-2 transition-colors hover:text-primary"
            >
              Конфиденциальность
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
