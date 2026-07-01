"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";

import { Logo } from "@/components/brand/logo";
import { EmailGateModal } from "@/components/features/email-gate-modal";
import { EmailVerifyBanner } from "@/components/layout/email-verify-banner";
import { MoreSheet } from "@/components/layout/more-sheet";
import { NotificationBell } from "@/components/layout/notification-bell";
import { MOBILE_TABS, PERSONAL_NAV, PRIMARY_NAV, isActivePath } from "@/components/layout/nav-config";
import { UserMenu } from "@/components/layout/user-menu";
import { LinkButton } from "@/components/ui/link-button";
import { IconMore } from "@/components/ui/icons";
import { useAuthStatus } from "@/hooks/useMe";
import { cn } from "@/lib/utils";

// Единый навигационный хром (демо-канон): десктоп — вертикальный сайдбар + топбар,
// мобайл — нижний таб-бар. Адаптируется под вход. Используется и в приложении
// (за AuthGuard), и на публичных страницах каталога (без гейта).
export function NavShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const authed = useAuthStatus() === "authed";
  const home = authed ? "/games" : "/";

  return (
    <>
      <div className="min-h-screen lg:flex">
        <Sidebar pathname={pathname} authed={authed} home={home} />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar authed={authed} home={home} />
          <EmailVerifyBanner />
          <main className="flex-1 pb-24 lg:pb-10">{children}</main>
        </div>
      </div>
      <MobileTabBar pathname={pathname} authed={authed} />
      <EmailGateModal />
    </>
  );
}

function Sidebar({
  pathname,
  authed,
  home,
}: {
  pathname: string;
  authed: boolean;
  home: string;
}) {
  return (
    <aside className="sticky top-0 hidden h-screen w-60 flex-none flex-col border-r border-border bg-surface lg:flex">
      <div className="flex h-16 items-center px-5">
        <Link href={home} aria-label="pingUp">
          <Logo className="h-6" />
        </Link>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-2">
        {PRIMARY_NAV.map((item) => (
          <SidebarLink key={item.href} item={item} active={isActivePath(pathname, item.href)} />
        ))}
        {authed && (
          <>
            <div className="my-2 h-px bg-border" />
            {PERSONAL_NAV.map((item) => (
              <SidebarLink key={item.href} item={item} active={isActivePath(pathname, item.href)} />
            ))}
          </>
        )}
      </nav>
      {!authed && (
        <div className="border-t border-border p-3">
          <LinkButton href="/register" size="sm" fullWidth>
            Регистрация
          </LinkButton>
          <Link
            href="/login"
            className="mt-2 flex h-9 items-center justify-center rounded-lg text-sm font-bold text-fg-2 hover:bg-surface-2"
          >
            Войти
          </Link>
        </div>
      )}
    </aside>
  );
}

function SidebarLink({
  item,
  active,
}: {
  item: (typeof PRIMARY_NAV)[number];
  active: boolean;
}) {
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors",
        active ? "bg-primary-tint text-primary" : "text-fg-2 hover:bg-surface-2",
      )}
    >
      <item.icon size={19} />
      {item.label}
    </Link>
  );
}

function TopBar({ authed, home }: { authed: boolean; home: string }) {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-3 border-b border-border bg-surface/90 px-4 backdrop-blur-sm lg:px-6">
      <Link href={home} aria-label="pingUp" className="lg:hidden">
        <Logo className="h-6" />
      </Link>
      <div className="hidden lg:block" />
      <div className="flex items-center gap-1.5">
        {authed ? (
          <>
            <NotificationBell />
            <UserMenu />
          </>
        ) : (
          <>
            <Link href="/login" className="text-sm font-bold text-fg-2 hover:text-fg">
              Войти
            </Link>
            <LinkButton href="/register" size="sm">
              Регистрация
            </LinkButton>
          </>
        )}
      </div>
    </header>
  );
}

function MobileTabBar({ pathname, authed }: { pathname: string; authed: boolean }) {
  const [moreOpen, setMoreOpen] = useState(false);
  const moreActive = !MOBILE_TABS.some((t) => isActivePath(pathname, t.href));

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-40 flex h-16 items-stretch border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden">
        {MOBILE_TABS.map((item) => {
          const active = isActivePath(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1 text-[11px] font-semibold transition-colors",
                active ? "text-primary" : "text-muted",
              )}
            >
              <item.icon size={22} />
              {item.label}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setMoreOpen(true)}
          aria-label="Ещё"
          className={cn(
            "flex flex-1 flex-col items-center justify-center gap-1 text-[11px] font-semibold transition-colors",
            moreActive ? "text-primary" : "text-muted",
          )}
        >
          <IconMore size={22} />
          Ещё
        </button>
      </nav>
      <MoreSheet open={moreOpen} onClose={() => setMoreOpen(false)} authed={authed} />
    </>
  );
}
