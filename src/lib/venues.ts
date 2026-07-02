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

// working_hours — свободный JSONB; фронт пишет и читает конвенцию {"text": "..."}.
export function workingHoursLabel(wh: Record<string, unknown> | null): string | null {
  if (!wh) return null;
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
