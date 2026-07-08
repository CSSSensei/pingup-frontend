import type { EventType, NotificationType } from "@/lib/enums";
import type { NotificationItem } from "@/types/api";

// Телеграм-бот поддержки с диплинком (?start=pingup — метка источника для бота).
export const SUPPORT_URL = "https://t.me/phasalobot?start=pingup";

// "tournament" здесь нет намеренно — это тип только у объявлений напарников, не у событий.
const SECTION_BY_TYPE: Partial<Record<EventType, string>> = {
  game: "/games",
  group_training: "/trainings",
  personal_sparring: "/trainings",
};

export function eventHref(event: { id: number; event_type: EventType }): string {
  return `${SECTION_BY_TYPE[event.event_type] ?? "/games"}/${event.id}`;
}

// Разделы «Игры» и «Тренировки» — одни и те же события; страницы деталей/manage
// сами перекидывают на верный раздел, если тип не совпал с URL (поэтому
// диплинки уведомлений могут смело вести в /games/...).
export type EventSection = "games" | "trainings";

export function eventSection(type: EventType): EventSection {
  return type === "game" ? "games" : "trainings";
}

// Диплинк уведомления по его type + data-payload; null → просто отметить прочитанным.
export function notificationHref(n: NotificationItem): string | null {
  const data = n.data ?? {};
  const eventId = typeof data.event_id === "number" ? data.event_id : null;
  // Бэкенд кладёт id объявления как partner_request_id (см. partner_service).
  const requestId =
    typeof data.partner_request_id === "number" ? data.partner_request_id : null;
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

  // Автору отклика — сразу в консоль откликов; откликнувшемуся о совпадении — на объявление.
  if (n.type === "partner_response" && requestId) return `/partners/${requestId}/responses`;
  if (n.type === "partner_matched" && requestId) return `/partners/${requestId}`;
  if (n.type === "tournament_announce" || n.type === "tournament_reminder") {
    return tournamentSlug ? `/tournaments/${tournamentSlug}` : "/tournaments";
  }
  if (n.type === "report_resolved") return "/reports";
  if (n.type === "rating_updated" || n.type === "review_received") return "/profile";
  return null;
}
