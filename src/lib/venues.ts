import { formatWeekScheduleBrief, parseWeekSchedule } from "@/lib/schedule";
import type { VenueRead } from "@/types/api";

function plural(n: number, forms: [string, string, string]): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return forms[0];
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return forms[1];
  return forms[2];
}

export function tablesLabel(n: number): string {
  return `${n} ${plural(n, ["стол", "стола", "столов"])}`;
}

export function tablesCount(venue: VenueRead): number | null {
  if (venue.map_tables_count > 0) return venue.map_tables_count;
  return venue.tables_count;
}

export function reviewsLabel(n: number): string {
  return `${n} ${plural(n, ["отзыв", "отзыва", "отзывов"])}`;
}

// rating_avg — Decimal с бэка, приходит строкой ("4.50"). 0 отзывов → рейтинга ещё нет.
export function venueRatingLabel(venue: VenueRead): string | null {
  if (venue.reviews_count === 0) return null;
  const n = Number(venue.rating_avg);
  if (!Number.isFinite(n)) return null;
  return n.toFixed(1).replace(".", ",");
}

// Структурный {schedule} рендерим в компактную строку; legacy {text} — как есть.
export function workingHoursLabel(wh: Record<string, unknown> | null): string | null {
  if (!wh) return null;
  const schedule = parseWeekSchedule(wh);
  if (schedule) return formatWeekScheduleBrief(schedule);
  const text = wh.text;
  return typeof text === "string" && text.trim() ? text : null;
}

export function coverPhoto(venue: VenueRead): string | null {
  const photo = venue.photos.find((p) => p.is_cover) ?? venue.photos[0];
  return photo?.url ?? null;
}

// Маршрут в Яндекс Картах от текущего местоположения — работает без API-ключа.
export function routeUrl(venue: VenueRead): string {
  return `https://yandex.ru/maps/?rtext=~${venue.lat},${venue.lng}&rtt=auto`;
}

export function websiteUrl(site: string): string {
  return /^https?:\/\//.test(site) ? site : `https://${site}`;
}

export function websiteLabel(site: string): string {
  return site.replace(/^https?:\/\//, "").replace(/\/$/, "");
}
