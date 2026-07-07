import type { ComponentType, SVGProps } from "react";

import {
  IconAward,
  IconCalendar,
  IconDumbbell,
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

export const PRIMARY_NAV: NavItem[] = [
  { href: "/games", label: "Игры", icon: IconPaddle },
  { href: "/trainings", label: "Тренировки", icon: IconDumbbell },
  { href: "/partners", label: "Напарники", icon: IconUsers },
  { href: "/tournaments", label: "Турниры", icon: IconTrophy },
  { href: "/venues", label: "Залы", icon: IconPin },
  { href: "/players", label: "Игроки", icon: IconUser },
  { href: "/rating", label: "Топ", icon: IconAward },
];

export const PERSONAL_NAV: NavItem[] = [{ href: "/me", label: "Мои", icon: IconCalendar }];

export const MOBILE_TABS: NavItem[] = PRIMARY_NAV.slice(0, 4);

export const MORE_SHEET: NavItem[] = [...PRIMARY_NAV.slice(4), ...PERSONAL_NAV];

export function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
