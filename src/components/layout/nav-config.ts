import type { ComponentType, SVGProps } from "react";

import {
  IconAward,
  IconCalendar,
  IconPaddle,
  IconPin,
  IconTrophy,
  IconUser,
  IconUsers,
} from "@/components/ui/icons";

type Icon = ComponentType<SVGProps<SVGSVGElement> & { size?: number }>;

export interface NavItem {
  href: string;
  label: string;
  icon: Icon;
}

// Разделы каталога (§1: отдельные разделы, не хаб). Единый источник для сайдбара и таб-бара.
export const PRIMARY_NAV: NavItem[] = [
  { href: "/games", label: "Игры", icon: IconPaddle },
  { href: "/trainings", label: "Тренировки", icon: IconCalendar },
  { href: "/partners", label: "Напарники", icon: IconUsers },
  { href: "/tournaments", label: "Турниры", icon: IconTrophy },
  { href: "/venues", label: "Залы", icon: IconPin },
  { href: "/players", label: "Игроки", icon: IconUser },
  { href: "/rating", label: "Рейтинг", icon: IconAward },
];

// Личное для вошедшего в сайдбаре — только «Мои» (мои игры/события).
// Аккаунт (Профиль/Настройки/Уведомления/Выйти) НЕ здесь: он в топбаре
// (колокол + меню аватара), чтобы не дублировать сайдбар.
export const PERSONAL_NAV: NavItem[] = [{ href: "/me", label: "Мои", icon: IconCalendar }];

// Нижний таб-бар (мобайл): 4 раздела + слот «Ещё» рендерится отдельно.
export const MOBILE_TABS: NavItem[] = PRIMARY_NAV.slice(0, 4);

// Sheet «Ещё» — только разделы, не влезшие в таб-бар (+ «Мои» для вошедшего).
export const MORE_SHEET: NavItem[] = [...PRIMARY_NAV.slice(4), ...PERSONAL_NAV];

export function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
