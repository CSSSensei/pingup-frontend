"use client";

import { EmptyState, ErrorState } from "@/components/common/states";
import { NotificationItem } from "@/components/features/notification-item";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { IconBell } from "@/components/ui/icons";
import { Skeleton } from "@/components/ui/skeleton";
import { useMarkAllRead, useNotifications } from "@/hooks/useNotifications";

export default function NotificationsPage() {
  const query = useNotifications();
  const markAll = useMarkAllRead();
  const unread = query.data?.unread_count ?? 0;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:py-8">
      <PageHeader
        title="Уведомления"
        actions={
          unread > 0 ? (
            <Button size="sm" variant="secondary" loading={markAll.isPending} onClick={() => markAll.mutate()}>
              Прочитать всё
            </Button>
          ) : undefined
        }
      />

      {query.isPending ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : query.isError ? (
        <ErrorState onRetry={() => query.refetch()} />
      ) : query.data.items.length === 0 ? (
        <EmptyState
          icon={<IconBell size={32} />}
          title="Уведомлений нет"
          description="Здесь появятся отклики на игры, подтверждения и другие события."
        />
      ) : (
        <div className="space-y-2.5">
          {query.data.items.map((n) => (
            <NotificationItem key={n.id} notification={n} />
          ))}
        </div>
      )}
    </div>
  );
}
