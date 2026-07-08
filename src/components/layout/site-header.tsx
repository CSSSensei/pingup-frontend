import Link from "next/link";

import { Logo } from "@/components/brand/logo";
import { GuestAuthButtons } from "@/components/layout/guest-auth-buttons";
import { NotificationBell } from "@/components/layout/notification-bell";
import { UserMenu } from "@/components/layout/user-menu";

export function SiteHeader({
  authed,
  home,
}: {
  authed: boolean;
  home: string;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1320px] items-center justify-between gap-4 px-5">
        <Link href={home} aria-label="pingup">
          <Logo className="h-9" />
        </Link>
        <div className="flex items-center gap-2">
          {authed ? (
            <>
              <NotificationBell />
              <UserMenu />
            </>
          ) : (
            <GuestAuthButtons />
          )}
        </div>
      </div>
    </header>
  );
}
