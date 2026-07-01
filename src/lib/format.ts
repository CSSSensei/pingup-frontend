// Регион MVP — Смоленск (Europe/Moscow). События несут ISO-время с tz; форматируем в МСК.
const TZ = "Europe/Moscow";

const dateFmt = new Intl.DateTimeFormat("ru-RU", {
  timeZone: TZ,
  day: "numeric",
  month: "long",
});

const dateShortFmt = new Intl.DateTimeFormat("ru-RU", {
  timeZone: TZ,
  day: "numeric",
  month: "short",
});

const timeFmt = new Intl.DateTimeFormat("ru-RU", {
  timeZone: TZ,
  hour: "2-digit",
  minute: "2-digit",
});

const weekdayFmt = new Intl.DateTimeFormat("ru-RU", { timeZone: TZ, weekday: "short" });

const monthYearFmt = new Intl.DateTimeFormat("ru-RU", { timeZone: TZ, month: "short", year: "numeric" });

export function formatMonthYear(iso: string): string {
  return monthYearFmt.format(new Date(iso));
}

const dayMonthYearFmt = new Intl.DateTimeFormat("ru-RU", {
  timeZone: TZ,
  day: "numeric",
  month: "short",
  year: "numeric",
});

export function formatDayMonthYear(iso: string): string {
  return dayMonthYearFmt.format(new Date(iso));
}

export function formatDate(iso: string): string {
  return dateFmt.format(new Date(iso));
}

export function formatTime(iso: string): string {
  return timeFmt.format(new Date(iso));
}

// «сб, 12 июл · 18:30» — компактная строка для карточек событий.
export function formatEventWhen(iso: string): string {
  const d = new Date(iso);
  return `${weekdayFmt.format(d)}, ${dateShortFmt.format(d)} · ${timeFmt.format(d)}`;
}

export function formatDateTime(iso: string): string {
  return `${formatDate(iso)}, ${formatTime(iso)}`;
}

export function formatTimeRange(startIso: string, endIso: string | null): string {
  if (!endIso) return formatTime(startIso);
  return `${formatTime(startIso)}–${formatTime(endIso)}`;
}

const rtf = new Intl.RelativeTimeFormat("ru-RU", { numeric: "auto" });

export function formatRelative(iso: string): string {
  const diffMs = new Date(iso).getTime() - Date.now();
  const diffSec = Math.round(diffMs / 1000);
  const abs = Math.abs(diffSec);
  if (abs < 60) return "только что";
  const diffMin = Math.round(diffSec / 60);
  if (Math.abs(diffMin) < 60) return rtf.format(diffMin, "minute");
  const diffHour = Math.round(diffMin / 60);
  if (Math.abs(diffHour) < 24) return rtf.format(diffHour, "hour");
  const diffDay = Math.round(diffHour / 24);
  if (Math.abs(diffDay) < 30) return rtf.format(diffDay, "day");
  return dateShortFmt.format(new Date(iso));
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} м`;
  return `${km.toFixed(km < 10 ? 1 : 0)} км`;
}

export function formatPrice(price: string | null): string | null {
  if (price == null) return null;
  const n = Number(price);
  if (Number.isNaN(n)) return null;
  if (n === 0) return "Бесплатно";
  return `${n.toLocaleString("ru-RU")} ₽`;
}
