import type { Interval } from "@/lib/schedule";
import type { ScheduleException, ScheduleExceptionKind } from "@/types/api";

export const EXC_KIND_LABELS: Record<ScheduleExceptionKind, string> = {
  closed: "Закрыто",
  hours: "Особые часы",
  block: "Блок времени",
};

const MONTHS = [
  "янв", "фев", "мар", "апр", "мая", "июн", "июл", "авг", "сен", "окт", "ноя", "дек",
];

// "YYYY-MM-DD" → "10 июл"
export function formatExcDate(d: string): string {
  const [, m, day] = d.split("-");
  return `${Number(day)} ${MONTHS[Number(m) - 1] ?? ""}`;
}

export function formatExcDateRange(from: string, to: string): string {
  return from === to ? formatExcDate(from) : `${formatExcDate(from)} — ${formatExcDate(to)}`;
}

export function formatIntervals(intervals: Interval[] | null): string {
  if (!intervals || intervals.length === 0) return "";
  return intervals.map((iv) => `${iv.open}–${iv.close}`).join(", ");
}

export function describeException(exc: ScheduleException, tableLabel?: string): string {
  const scope = exc.table_id == null ? "Весь зал" : `Стол ${tableLabel ?? `#${exc.table_id}`}`;
  const times = formatIntervals(exc.intervals);
  const what =
    exc.kind === "closed" ? "закрыт" : exc.kind === "hours" ? `часы ${times}` : `блок ${times}`;
  return `${scope} · ${what}`;
}
