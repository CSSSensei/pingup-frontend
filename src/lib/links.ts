import type { EventType, NotificationType } from "@/lib/enums";
import type { NotificationItem } from "@/types/api";

const SECTION_BY_TYPE: Record<EventType, string> = {
  game: "/games",
  group_training: "/trainings",
  personal_sparring: "/trainings",
};

export function eventHref(event: { id: number; event_type: EventType }): string {
  return `${SECTION_BY_TYPE[event.event_type]}/${event.id}`;
}

// Диплинк уведомления по его type + data-payload; null → просто отметить прочитанным.
export function notificationHref(n: NotificationItem): string | null {
  const data = n.data ?? {};
  const eventId = typeof data.event_id === "number" ? data.event_id : null;
  const requestId = typeof data.request_id === "number" ? data.request_id : null;
  const tournamentSlug = typeof data.tournament_slug === "string" ? data.tournament_slug : null;

  const eventTargets: Partial<Record<NotificationType, string>> = {
    event_join_request: eventId ? `/games/${eventId}/manage` : "",
    event_confirmed: eventId ? `/games/${eventId}` : "",
    event_cancelled: eventId ? `/games/${eventId}` : "",
    event_reminder: eventId ? `/games/${eventId}` : "",
    event_invite: eventId ? `/games/${eventId}` : "",
  };
  const target = eventTargets[n.type];
  if (target) return target;

  if ((n.type === "partner_response" || n.type === "partner_matched") && requestId) {
    return `/partners/${requestId}`;
  }
  if (n.type === "tournament_announce" || n.type === "tournament_reminder") {
    return tournamentSlug ? `/tournaments/${tournamentSlug}` : "/tournaments";
  }
  if (n.type === "rating_updated" || n.type === "review_received") return "/profile";
  return null;
}
