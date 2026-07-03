import {
  EVENT_STATUS_LABELS,
  PARTNER_STATUS_LABELS,
  REPORT_TARGET_LABELS,
  TOURNAMENT_STATUS_LABELS,
  type EventStatus,
  type PartnerRequestStatus,
  type ReportTargetType,
  type TournamentStatus,
} from "@/lib/enums";

type Snapshot = Record<string, unknown> | null | undefined;

function str(v: unknown): string | null {
  return typeof v === "string" && v.length > 0 ? v : null;
}
function num(v: unknown): number | null {
  return typeof v === "number" ? v : null;
}
const yesNo = (v: unknown) => (v === true ? "Да" : "Нет");

export function reporterLabel(reporterId: number | null): string {
  return reporterId == null ? "Аноним" : `От пользователя #${reporterId}`;
}

export function targetLabel(type: ReportTargetType, targetId: number): string {
  return `${REPORT_TARGET_LABELS[type]} #${targetId}`;
}

// Ссылка на публичную страницу цели по снапшоту (когда есть slug/id). null → открыть негде.
export function snapshotTargetLink(
  type: ReportTargetType,
  snapshot: Snapshot,
): { href: string; label: string } | null {
  if (!snapshot) return null;
  const slug = str(snapshot.slug);
  const id = num(snapshot.id);
  switch (type) {
    case "venue":
      return slug ? { href: `/venues/${slug}`, label: "Открыть зал" } : null;
    case "tournament":
      return slug ? { href: `/tournaments/${slug}`, label: "Открыть турнир" } : null;
    case "event":
      return id != null ? { href: `/games/${id}`, label: "Открыть событие" } : null;
    case "partner_request":
      return id != null ? { href: `/partners/${id}`, label: "Открыть объявление" } : null;
    // user: в снапшоте нет slug → страницу игрока не открыть; review — своей страницы нет.
    default:
      return null;
  }
}

// Пары «поле → значение» из снапшота для показа модератору. Пусто → цель недоступна.
export function snapshotRows(
  type: ReportTargetType,
  snapshot: Snapshot,
): { label: string; value: string }[] {
  if (!snapshot) return [];
  const rows: { label: string; value: string }[] = [];
  const add = (label: string, value: string | null) => {
    if (value != null) rows.push({ label, value });
  };

  switch (type) {
    case "user":
      add("Имя", str(snapshot.display_name) ?? "—");
      add("Email", str(snapshot.email));
      add("Роль", str(snapshot.role));
      break;
    case "venue":
      add("Название", str(snapshot.name));
      add("Проверен", yesNo(snapshot.is_verified));
      break;
    case "event":
      add("Название", str(snapshot.title));
      add("Статус", eventStatusLabel(str(snapshot.status)));
      break;
    case "review": {
      const rating = num(snapshot.rating);
      add("Оценка", rating != null ? `${rating} / 5` : null);
      add("Комментарий", str(snapshot.comment) ?? "—");
      add("Скрыт", yesNo(snapshot.is_hidden));
      const author = num(snapshot.author_id);
      add("Автор", author != null ? `#${author}` : null);
      break;
    }
    case "partner_request":
      add("Заголовок", str(snapshot.title));
      add("Статус", partnerStatusLabel(str(snapshot.status)));
      add("Автор", num(snapshot.author_id) != null ? `#${num(snapshot.author_id)}` : null);
      break;
    case "tournament":
      add("Название", str(snapshot.title));
      add("Статус", tournamentStatusLabel(str(snapshot.status)));
      break;
  }
  return rows;
}

function eventStatusLabel(s: string | null): string | null {
  if (!s) return null;
  return EVENT_STATUS_LABELS[s as EventStatus] ?? s;
}
function partnerStatusLabel(s: string | null): string | null {
  if (!s) return null;
  return PARTNER_STATUS_LABELS[s as PartnerRequestStatus] ?? s;
}
function tournamentStatusLabel(s: string | null): string | null {
  if (!s) return null;
  return TOURNAMENT_STATUS_LABELS[s as TournamentStatus] ?? s;
}
