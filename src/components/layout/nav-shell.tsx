"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";

import { EmailGateModal } from "@/components/features/email-gate-modal";
import { EmailVerifyBanner } from "@/components/layout/email-verify-banner";
import { MoreSheet } from "@/components/layout/more-sheet";
import {
  MOBILE_TABS,
  MORE_SHEET,
  PERSONAL_NAV,
  PRIMARY_NAV,
  isActivePath,
} from "@/components/layout/nav-config";
import { SiteHeader } from "@/components/layout/site-header";
import { IconMore } from "@/components/ui/icons";
import { useAuthStatus } from "@/hooks/useMe";
import { cn } from "@/lib/utils";

export function NavShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const authed = useAuthStatus() === "authed";
  const home = authed ? "/games" : "/";

  return (
    <>
      <SiteHeader authed={authed} home={home} />
      <div className="mx-auto min-h-[calc(100vh-4rem)] max-w-[1320px] lg:flex">
        <Sidebar pathname={pathname} authed={authed} />
        <div className="flex min-w-0 flex-1 flex-col">
          <EmailVerifyBanner />
          <main className="flex-1 pb-[calc(6rem+env(safe-area-inset-bottom))] lg:pb-10">
            {children}
          </main>
        </div>
      </div>
      <MobileTabBar pathname={pathname} authed={authed} />
      <EmailGateModal />
    </>
  );
}

function Sidebar({ pathname, authed }: { pathname: string; authed: boolean }) {
  return (
    <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-60 flex-none flex-col border-r border-border bg-surface lg:flex">
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        {PRIMARY_NAV.map((item) => (
          <SidebarLink
            key={item.href}
            item={item}
            active={isActivePath(pathname, item.href)}
          />
        ))}
        {authed && (
          <>
            <div className="my-2 h-px bg-border" />
            {PERSONAL_NAV.map((item) => (
              <SidebarLink
                key={item.href}
                item={item}
                active={isActivePath(pathname, item.href)}
              />
            ))}
          </>
        )}
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
        active
          ? "bg-primary-tint text-primary"
          : "text-fg-2 hover:bg-surface-2",
      )}
    >
      <item.icon size={19} />
      {item.label}
    </Link>
  );
}

function MobileTabBar({
  pathname,
  authed,
}: {
  pathname: string;
  authed: boolean;
}) {
  const [moreOpen, setMoreOpen] = useState(false);
  const moreActive = MORE_SHEET.some((t) => isActivePath(pathname, t.href));

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden">
        <div className="flex h-16 items-stretch">
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
        </div>
      </nav>
      <MoreSheet
        open={moreOpen}
        onClose={() => setMoreOpen(false)}
        authed={authed}
      />
    </>
  );
}
