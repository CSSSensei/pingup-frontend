import Link from "next/link";
import type { ReactNode } from "react";

import { Logo } from "@/components/brand/logo";
import { HeroSearch } from "@/components/landing/hero-search";
import { IconChevronRight, IconPaddle, IconPin, IconTrophy } from "@/components/ui/icons";

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
    desc: "Открытые игры и личные спарринги рядом. Записывайся в один тап.",
  },
  {
    href: "/venues",
    icon: <IconPin size={24} />,
    title: "Залы Смоленска",
    desc: "Столы, цены, часы работы и отзывы. От «Юбилейного» до «Галактики».",
  },
  {
    href: "/tournaments",
    icon: <IconTrophy size={24} />,
    title: "Турниры",
    desc: "Городские и клубные турниры. Регистрация и регламент онлайн.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface">
      <header className="sticky top-0 z-40 border-b border-border bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1160px] items-center justify-between gap-4 px-5">
          <Link href="/" aria-label="pingUp">
            <Logo className="h-[26px]" />
          </Link>
          <nav className="hidden items-center gap-1 sm:flex">
            <Link href="/games" className="rounded px-3 py-2 text-sm font-semibold text-fg-2 hover:bg-surface-2">
              Игры
            </Link>
            <Link href="/venues" className="rounded px-3 py-2 text-sm font-semibold text-fg-2 hover:bg-surface-2">
              Залы
            </Link>
            <Link href="/tournaments" className="rounded px-3 py-2 text-sm font-semibold text-fg-2 hover:bg-surface-2">
              Турниры
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="flex h-10 items-center rounded border border-border bg-surface px-4 text-sm font-bold text-fg hover:bg-surface-2"
            >
              Войти
            </Link>
            <Link
              href="/register"
              className="flex h-10 items-center rounded bg-primary px-4 text-sm font-bold text-white shadow-card hover:bg-primary-600"
            >
              Регистрация
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-border">
        <div className="pointer-events-none absolute -top-[110px] -right-[90px] size-[340px] rounded-full bg-[radial-gradient(circle_at_35%_30%,#fff,#e2e2e2_52%,#ababab)] opacity-50 blur-[2px]" />
        <div className="pointer-events-none absolute bottom-[8%] left-[6%] size-[130px] rounded-full bg-[radial-gradient(circle_at_35%_30%,#fff,#e2e2e2_52%,#ababab)] opacity-35" />
        <div className="relative mx-auto max-w-[1160px] px-5 py-12 sm:py-20">
          <span className="inline-flex items-center gap-2 rounded-pill bg-primary-tint px-3 py-1.5 text-[12.5px] font-bold text-primary">
            <span className="size-[7px] rounded-full bg-primary" />
            Смоленск · настольный теннис
          </span>
          <h1 className="mt-4 max-w-[760px] text-[32px] leading-[1.04] font-extrabold tracking-[-0.02em] text-balance sm:text-[54px]">
            Найди игру, спарринг&nbsp;или турнир за пару минут
          </h1>
          <p className="mt-4 mb-6 max-w-[560px] text-[15px] leading-relaxed text-fg-2 sm:text-lg">
            pingUp собирает партнёров по уровню, залы, тренировки и турниры Смоленска в одном месте.
            Меньше переписок — больше игры.
          </p>
          <HeroSearch />
          <div className="mt-4 flex flex-wrap items-center gap-2 text-[13px]">
            <span className="text-muted">Популярное:</span>
            <Link href="/games" className="font-bold text-fg-2 hover:text-primary">
              Игра сегодня вечером
            </Link>
            <span className="text-border-strong">·</span>
            <Link href="/partners" className="font-bold text-fg-2 hover:text-primary">
              Спарринг под рейтинг
            </Link>
            <span className="text-border-strong">·</span>
            <Link href="/venues" className="font-bold text-fg-2 hover:text-primary">
              Залы рядом
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1160px] px-5 pt-12 pb-2">
        <div className="grid gap-4 sm:grid-cols-3">
          {FEATURES.map((f) => (
            <Link
              key={f.href}
              href={f.href}
              className="group rounded-lg border border-border bg-surface p-[22px] shadow-card transition hover:-translate-y-0.5 hover:shadow-pop"
            >
              <div className="mb-3.5 flex size-11 items-center justify-center rounded-xl bg-primary-tint text-primary">
                {f.icon}
              </div>
              <div className="mb-1.5 text-lg font-extrabold">{f.title}</div>
              <div className="mb-3.5 text-sm leading-normal text-muted">{f.desc}</div>
              <span className="inline-flex items-center gap-1.5 text-[13.5px] font-bold text-primary">
                Смотреть все
                <IconChevronRight size={16} className="transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1160px] px-5 pt-10 pb-14">
        <div className="flex flex-wrap items-center justify-between gap-5 rounded-lg bg-fg p-[34px]">
          <div>
            <div className="mb-1.5 text-[22px] font-extrabold text-white">Готов выйти к столу?</div>
            <div className="text-[14.5px] text-zinc-300">
              Создай профиль, подтяни рейтинг с теннис67.рф — и найди игру рядом.
            </div>
          </div>
          <Link
            href="/register"
            className="flex h-12 items-center rounded bg-primary px-[22px] text-[15px] font-bold text-white hover:bg-primary-600"
          >
            Создать профиль
          </Link>
        </div>
      </section>

      <footer className="border-t border-border bg-surface">
        <div className="mx-auto flex max-w-[1160px] flex-wrap items-center justify-between gap-3.5 px-5 py-[26px]">
          <div className="flex items-center gap-2.5">
            <Logo variant="mark" className="h-6" />
            <span className="text-[13px] text-muted">© 2026 pingUp · Смоленск</span>
          </div>
          <div className="flex gap-[18px] text-[13px] text-muted">
            <span>О сервисе</span>
            <span>Контакты</span>
            <span>Правила</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
