"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { Logo } from "@/components/brand/logo";
import { NotificationBell } from "@/components/layout/notification-bell";
import { PRIMARY_NAV, isActivePath } from "@/components/layout/nav-config";
import { UserMenu } from "@/components/layout/user-menu";
import { Button } from "@/components/ui/button";
import { useAuthStatus } from "@/hooks/useMe";
import { cn } from "@/lib/utils";

// Верхняя шапка публичных (SSR) страниц каталога. Состояние входа подмешивается на клиенте.
export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const status = useAuthStatus();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4">
        <Link href="/" aria-label="pingUp" className="flex-none">
          <Logo className="h-6" />
        </Link>
        <nav className="hidden flex-1 items-center gap-1 md:flex">
          {PRIMARY_NAV.slice(0, 5).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
                isActivePath(pathname, item.href)
                  ? "bg-primary-tint text-primary"
                  : "text-fg-2 hover:bg-surface-2",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex flex-1 items-center justify-end gap-2 md:flex-none">
          {status === "authed" ? (
            <>
              <NotificationBell />
              <UserMenu />
            </>
          ) : status === "anon" ? (
            <>
              <Link href="/login" className="text-sm font-bold text-fg-2 hover:text-fg">
                Войти
              </Link>
              <Button size="sm" onClick={() => router.push("/register")}>
                Регистрация
              </Button>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}
