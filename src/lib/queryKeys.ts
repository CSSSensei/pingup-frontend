import type { EventFilterParams, MyEventsParams } from "@/types/api";
import type { ParticipantStatus } from "@/lib/enums";

export const qk = {
  me: ["me"] as const,
  events: (filter?: EventFilterParams) => ["events", filter ?? {}] as const,
  event: (id: number) => ["event", id] as const,
  eventParticipants: (id: number, status?: ParticipantStatus) =>
    ["event", id, "participants", status ?? "all"] as const,
  myEvents: (params?: MyEventsParams) => ["myEvents", params ?? {}] as const,
  notifications: ["notifications"] as const,
  unreadCount: ["notifications", "unread"] as const,
  profile: (slug: string) => ["profile", slug] as const,
};
