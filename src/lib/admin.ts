// Подписи для счётчиков в детали пользователя (ключи из AdminUserDetail.counters).
export const USER_COUNTER_LABELS: Record<string, string> = {
  venues_created: "Создано залов",
  events_organized: "Организовано событий",
  reviews_written: "Написано отзывов",
  reports_filed: "Подано жалоб",
};

export function triggeredByLabel(value: string): string {
  if (value === "cron") return "Автосинк";
  if (value === "self") return "Игрок сам";
  if (value.startsWith("admin:")) return `Админ #${value.slice(6)}`;
  return value;
}

export function durationLabel(ms: number | null): string {
  if (ms == null) return "—";
  if (ms < 1000) return `${ms} мс`;
  return `${(ms / 1000).toFixed(1)} с`;
}
