import type { ComponentType, SVGProps } from "react";

import {
  IconBell,
  IconCalendar,
  IconPaddle,
  IconPin,
  IconSettings,
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
];

// Персональные поверхности (низ сайдбара / sheet «Ещё»).
export const PERSONAL_NAV: NavItem[] = [
  { href: "/me", label: "Мои", icon: IconCalendar },
  { href: "/notifications", label: "Уведомления", icon: IconBell },
  { href: "/profile", label: "Профиль", icon: IconUser },
  { href: "/settings", label: "Настройки", icon: IconSettings },
];

// Нижний таб-бар (мобайл): 4 раздела + слот «Ещё» рендерится отдельно.
export const MOBILE_TABS: NavItem[] = PRIMARY_NAV.slice(0, 4);

// Содержимое sheet «Ещё».
export const MORE_SHEET: NavItem[] = [
  ...PRIMARY_NAV.slice(4),
  { href: "/me", label: "Мои", icon: IconCalendar },
  { href: "/profile", label: "Профиль", icon: IconUser },
  { href: "/settings", label: "Настройки", icon: IconSettings },
];

export function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
