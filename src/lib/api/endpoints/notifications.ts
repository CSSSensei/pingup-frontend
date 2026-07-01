import { apiFetch } from "@/lib/api/client";
import { API_PREFIX } from "@/lib/constants";
import type {
  NotificationItem,
  NotificationListResponse,
  UnreadCountResponse,
} from "@/types/api";

export const notificationsApi = {
  list: () => apiFetch<NotificationListResponse>(`${API_PREFIX}/notifications?limit=50`),

  unreadCount: () => apiFetch<UnreadCountResponse>(`${API_PREFIX}/notifications/unread-count`),

  markRead: (id: number) =>
    apiFetch<NotificationItem>(`${API_PREFIX}/notifications/${id}/read`, { method: "POST" }),

  markAllRead: () =>
    apiFetch<{ updated: number }>(`${API_PREFIX}/notifications/read-all`, { method: "POST" }),

  remove: (id: number) =>
    apiFetch<void>(`${API_PREFIX}/notifications/${id}`, { method: "DELETE" }),
};
