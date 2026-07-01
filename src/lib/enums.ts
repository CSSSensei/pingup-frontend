// Классы бейджей — литералами, иначе Tailwind не увидит их при сканировании.

export const SKILL_LEVELS = ["beginner", "amateur", "intermediate", "advanced", "pro"] as const;
export type SkillLevel = (typeof SKILL_LEVELS)[number];

export const SKILL_LABELS: Record<SkillLevel, string> = {
  beginner: "Новичок",
  amateur: "Любитель",
  intermediate: "Средний",
  advanced: "Продвинутый",
  pro: "Профи",
};

export const SKILL_BADGE: Record<SkillLevel, string> = {
  beginner: "bg-skill-beginner/12 text-skill-beginner",
  amateur: "bg-skill-amateur/12 text-skill-amateur",
  intermediate: "bg-skill-intermediate/12 text-skill-intermediate",
  advanced: "bg-skill-advanced/12 text-skill-advanced",
  pro: "bg-skill-pro/12 text-skill-pro",
};

export const EVENT_STATUSES = [
  "draft",
  "open",
  "full",
  "in_progress",
  "completed",
  "cancelled",
] as const;
export type EventStatus = (typeof EVENT_STATUSES)[number];

export const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
  draft: "Черновик",
  open: "Открыто",
  full: "Мест нет",
  in_progress: "Идёт",
  completed: "Завершено",
  cancelled: "Отменено",
};

export const EVENT_STATUS_BADGE: Record<EventStatus, string> = {
  draft: "bg-surface-3 text-fg-2",
  open: "bg-status-open/12 text-status-open",
  full: "bg-status-full/12 text-status-full",
  in_progress: "bg-status-progress/12 text-status-progress",
  completed: "bg-status-completed/12 text-status-completed",
  cancelled: "bg-status-cancelled/12 text-status-cancelled",
};

export const EVENT_TYPES = ["game", "group_training", "personal_sparring"] as const;
export type EventType = (typeof EVENT_TYPES)[number];

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  game: "Игра",
  group_training: "Групповая тренировка",
  personal_sparring: "Личный спарринг",
};

export const EVENT_FORMATS = ["singles", "doubles", "group", "coaching"] as const;
export type EventFormat = (typeof EVENT_FORMATS)[number];

export const EVENT_FORMAT_LABELS: Record<EventFormat, string> = {
  singles: "Одиночка",
  doubles: "Пара",
  group: "Группа",
  coaching: "С тренером",
};

export const GENDERS = ["male", "female"] as const;
export type Gender = (typeof GENDERS)[number];

export const GENDER_LABELS: Record<Gender | "all", string> = {
  male: "Мужской",
  female: "Женский",
  all: "Любой",
};

export const PLAYING_HANDS = ["right", "left"] as const;
export type PlayingHand = (typeof PLAYING_HANDS)[number];

export const PLAYING_HAND_LABELS: Record<PlayingHand, string> = {
  right: "Правая",
  left: "Левая",
};

export const PARTICIPANT_STATUSES = [
  "pending",
  "confirmed",
  "declined",
  "cancelled",
  "kicked",
  "attended",
  "no_show",
] as const;
export type ParticipantStatus = (typeof PARTICIPANT_STATUSES)[number];

export const PARTICIPANT_STATUS_LABELS: Record<ParticipantStatus, string> = {
  pending: "Ожидает",
  confirmed: "Подтверждён",
  declined: "Отклонён",
  cancelled: "Отменён",
  kicked: "Удалён",
  attended: "Пришёл",
  no_show: "Не пришёл",
};

export const PARTICIPANT_STATUS_BADGE: Record<ParticipantStatus, string> = {
  pending: "bg-status-pending/12 text-status-pending",
  confirmed: "bg-status-confirmed/12 text-status-confirmed",
  declined: "bg-status-declined/12 text-status-declined",
  cancelled: "bg-status-cancelled/12 text-status-cancelled",
  kicked: "bg-status-cancelled/12 text-status-cancelled",
  attended: "bg-status-confirmed/12 text-status-confirmed",
  no_show: "bg-status-declined/12 text-status-declined",
};

export const PARTNER_REQUEST_STATUSES = ["active", "matched", "closed", "expired"] as const;
export type PartnerRequestStatus = (typeof PARTNER_REQUEST_STATUSES)[number];

export const PARTNER_STATUS_LABELS: Record<PartnerRequestStatus, string> = {
  active: "Активно",
  matched: "Найден",
  closed: "Закрыто",
  expired: "Истекло",
};

export const PARTNER_STATUS_BADGE: Record<PartnerRequestStatus, string> = {
  active: "bg-status-open/12 text-status-open",
  matched: "bg-status-confirmed/12 text-status-confirmed",
  closed: "bg-surface-3 text-fg-2",
  expired: "bg-surface-3 text-fg-2",
};

export const NOTIFICATION_TYPES = [
  "event_invite",
  "event_join_request",
  "event_confirmed",
  "event_cancelled",
  "event_reminder",
  "partner_response",
  "partner_matched",
  "review_received",
  "tournament_announce",
  "tournament_reminder",
  "rating_updated",
  "report_resolved",
] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];
