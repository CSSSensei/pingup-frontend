"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";

import { AuthGuard } from "@/components/auth/auth-guard";
import { EmailGateModal } from "@/components/features/email-gate-modal";
import { Logo } from "@/components/brand/logo";
import { EmailVerifyBanner } from "@/components/layout/email-verify-banner";
import { MoreSheet } from "@/components/layout/more-sheet";
import { NotificationBell } from "@/components/layout/notification-bell";
import { PERSONAL_NAV, PRIMARY_NAV, MOBILE_TABS, isActivePath } from "@/components/layout/nav-config";
import { UserMenu } from "@/components/layout/user-menu";
import { IconMore } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

// Онбординг — сфокусированный визард без навигационного хрома.
const BARE_ROUTES = ["/onboarding"];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  if (BARE_ROUTES.some((r) => pathname === r || pathname.startsWith(`${r}/`))) {
    return <AuthGuard>{children}</AuthGuard>;
  }

  return (
    <AuthGuard>
      <div className="min-h-screen lg:flex">
        <Sidebar pathname={pathname} />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar />
          <EmailVerifyBanner />
          <main className="flex-1 pb-24 lg:pb-10">{children}</main>
        </div>
      </div>
      <MobileTabBar pathname={pathname} />
      <EmailGateModal />
    </AuthGuard>
  );
}

function Sidebar({ pathname }: { pathname: string }) {
  return (
    <aside className="sticky top-0 hidden h-screen w-60 flex-none flex-col border-r border-border bg-surface lg:flex">
      <div className="flex h-16 items-center px-5">
        <Link href="/games" aria-label="pingUp">
          <Logo className="h-6" />
        </Link>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-2">
        {PRIMARY_NAV.map((item) => (
          <SidebarLink key={item.href} item={item} active={isActivePath(pathname, item.href)} />
        ))}
        <div className="my-2 h-px bg-border" />
        {PERSONAL_NAV.map((item) => (
          <SidebarLink key={item.href} item={item} active={isActivePath(pathname, item.href)} />
        ))}
      </nav>
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

function TopBar() {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-3 border-b border-border bg-surface/90 px-4 backdrop-blur-sm lg:px-6">
      <Link href="/games" aria-label="pingUp" className="lg:hidden">
        <Logo className="h-6" />
      </Link>
      <div className="hidden lg:block" />
      <div className="flex items-center gap-1.5">
        <NotificationBell />
        <UserMenu />
      </div>
    </header>
  );
}

function MobileTabBar({ pathname }: { pathname: string }) {
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
      <MoreSheet open={moreOpen} onClose={() => setMoreOpen(false)} />
    </>
  );
}
