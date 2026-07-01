"use client";

import { useRouter } from "next/navigation";

import {
  IconBell,
  IconCalendar,
  IconCheck,
  IconTrophy,
  IconUsers,
} from "@/components/ui/icons";
import { useMarkRead } from "@/hooks/useNotifications";
import type { NotificationType } from "@/lib/enums";
import { formatRelative } from "@/lib/format";
import { notificationHref } from "@/lib/links";
import { cn } from "@/lib/utils";
import type { NotificationItem as Notification } from "@/types/api";

const ICONS: Partial<Record<NotificationType, typeof IconBell>> = {
  event_join_request: IconUsers,
  event_confirmed: IconCheck,
  event_cancelled: IconCalendar,
  event_reminder: IconCalendar,
  event_invite: IconCalendar,
  partner_response: IconUsers,
  partner_matched: IconUsers,
  tournament_announce: IconTrophy,
  tournament_reminder: IconTrophy,
};

export function NotificationItem({ notification }: { notification: Notification }) {
  const router = useRouter();
  const markRead = useMarkRead();
  const Icon = ICONS[notification.type] ?? IconBell;
  const href = notificationHref(notification);

  const onClick = () => {
    if (!notification.is_read) markRead.mutate(notification.id);
    if (href) router.push(href);
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-start gap-3 rounded-lg border border-border p-4 text-left transition-colors hover:bg-surface-2",
        notification.is_read ? "bg-surface" : "bg-primary-tint",
      )}
    >
      <span
        className={cn(
          "flex size-9 flex-none items-center justify-center rounded-full",
          notification.is_read ? "bg-surface-3 text-fg-2" : "bg-primary/12 text-primary",
        )}
      >
        <Icon size={18} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-bold text-fg">{notification.title}</p>
          {!notification.is_read && (
            <span className="mt-1.5 size-2 flex-none rounded-full bg-primary" aria-label="Новое" />
          )}
        </div>
        {notification.body && (
          <p className="mt-0.5 truncate text-[13px] text-fg-2">{notification.body}</p>
        )}
        <p className="mt-1 text-xs text-muted">{formatRelative(notification.created_at)}</p>
      </div>
    </button>
  );
}
