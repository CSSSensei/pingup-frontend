"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { notificationsApi } from "@/lib/api/endpoints/notifications";
import { qk } from "@/lib/queryKeys";
import { useAuthStore } from "@/stores/auth";
import type { NotificationListResponse, UnreadCountResponse } from "@/types/api";

// В фоне (скрытая вкладка) поллинг на паузе — экономим запросы.
export function useUnreadCount() {
  const status = useAuthStore((s) => s.status);
  return useQuery({
    queryKey: qk.unreadCount,
    queryFn: notificationsApi.unreadCount,
    enabled: status === "authed",
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
    select: (d) => d.unread_count,
  });
}

export function useNotifications() {
  const status = useAuthStore((s) => s.status);
  return useQuery({
    queryKey: qk.notifications,
    queryFn: notificationsApi.list,
    enabled: status === "authed",
    staleTime: 15_000,
  });
}

export function useMarkRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => notificationsApi.markRead(id),
    onMutate: async (id: number) => {
      await qc.cancelQueries({ queryKey: qk.notifications });
      const prevList = qc.getQueryData<NotificationListResponse>(qk.notifications);
      const prevCount = qc.getQueryData<UnreadCountResponse>(qk.unreadCount);
      const wasUnread = prevList?.items.some((n) => n.id === id && !n.is_read) ?? false;
      if (prevList && wasUnread) {
        qc.setQueryData<NotificationListResponse>(qk.notifications, {
          ...prevList,
          unread_count: Math.max(0, prevList.unread_count - 1),
          items: prevList.items.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
        });
      }
      if (prevCount && wasUnread) {
        qc.setQueryData<UnreadCountResponse>(qk.unreadCount, {
          unread_count: Math.max(0, prevCount.unread_count - 1),
        });
      }
      return { prevList, prevCount, wasUnread };
    },
    onError: (_e, _id, ctx) => {
      if (ctx?.prevList) qc.setQueryData(qk.notifications, ctx.prevList);
      if (ctx?.prevCount) qc.setQueryData(qk.unreadCount, ctx.prevCount);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: qk.notifications });
      qc.invalidateQueries({ queryKey: qk.unreadCount });
    },
  });
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: notificationsApi.markAllRead,
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: qk.notifications });
      const prevList = qc.getQueryData<NotificationListResponse>(qk.notifications);
      if (prevList) {
        qc.setQueryData<NotificationListResponse>(qk.notifications, {
          ...prevList,
          unread_count: 0,
          items: prevList.items.map((n) => ({ ...n, is_read: true })),
        });
      }
      qc.setQueryData(qk.unreadCount, { unread_count: 0 });
      return { prevList };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prevList) qc.setQueryData(qk.notifications, ctx.prevList);
      qc.invalidateQueries({ queryKey: qk.unreadCount });
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: qk.notifications });
      qc.invalidateQueries({ queryKey: qk.unreadCount });
    },
  });
}
