"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { Avatar } from "@/components/common/avatar";
import {
  IconBuilding,
  IconLogOut,
  IconSend,
  IconSettings,
  IconShieldCheck,
  IconUser,
} from "@/components/ui/icons";
import { useLogout } from "@/hooks/useAuth";
import { useMe } from "@/hooks/useMe";
import { useManagedVenues } from "@/hooks/useMyVenues";
import { SUPPORT_URL } from "@/lib/links";
import { isModerator } from "@/lib/roles";
import { cn } from "@/lib/utils";

export function UserMenu() {
  const { data: me } = useMe();
  const { logout } = useLogout();
  const { data: managedVenues } = useManagedVenues();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!me) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full p-0.5 transition-colors hover:bg-surface-2"
      >
        <Avatar src={me.profile.avatar_url} name={me.profile.display_name} size={34} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-lg border border-border bg-surface py-1 shadow-pop motion-safe:animate-[pu-pop_0.14s_ease-out]"
        >
          <div className="border-b border-border px-4 py-2.5">
            <p className="truncate text-sm font-bold text-fg">{me.profile.display_name}</p>
            <p className="truncate text-xs text-muted">{me.email}</p>
          </div>
          <MenuLink href="/profile" icon={<IconUser size={17} />} onClick={() => setOpen(false)}>
            Профиль
          </MenuLink>
          <MenuLink href="/settings" icon={<IconSettings size={17} />} onClick={() => setOpen(false)}>
            Настройки
          </MenuLink>
          {managedVenues && managedVenues.length > 0 && (
            <MenuLink href="/my-venues" icon={<IconBuilding size={17} />} onClick={() => setOpen(false)}>
              Мои залы
            </MenuLink>
          )}
          {isModerator(me.role) && (
            <MenuLink href="/admin" icon={<IconShieldCheck size={17} />} onClick={() => setOpen(false)}>
              Модерация
            </MenuLink>
          )}
          <a
            href={SUPPORT_URL}
            target="_blank"
            rel="noopener noreferrer"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-fg-2 transition-colors hover:bg-surface-2"
          >
            <IconSend size={17} />
            Поддержка
          </a>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              logout();
            }}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm font-semibold text-danger transition-colors hover:bg-surface-2"
          >
            <IconLogOut size={17} />
            Выйти
          </button>
        </div>
      )}
    </div>
  );
}

function MenuLink({
  href,
  icon,
  children,
  onClick,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      onClick={onClick}
      className={cn(
        "flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-fg-2 transition-colors hover:bg-surface-2",
      )}
    >
      {icon}
      {children}
    </Link>
  );
}
