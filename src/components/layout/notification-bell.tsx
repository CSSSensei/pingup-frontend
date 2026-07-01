"use client";

import Link from "next/link";

import { IconBell } from "@/components/ui/icons";
import { useUnreadCount } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";

export function NotificationBell({ className }: { className?: string }) {
  const { data: count = 0 } = useUnreadCount();

  return (
    <Link
      href="/notifications"
      aria-label={count > 0 ? `Уведомления: ${count} новых` : "Уведомления"}
      className={cn(
        "relative inline-flex size-10 items-center justify-center rounded-full text-fg-2 transition-colors hover:bg-surface-2",
        className,
      )}
    >
      <IconBell size={20} />
      {count > 0 && (
        <span className="absolute top-1.5 right-1.5 flex min-w-[17px] items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
