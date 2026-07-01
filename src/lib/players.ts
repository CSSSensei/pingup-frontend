// Возраст по году рождения (приблизительно — без дня/месяца).
export function ageFromBirthYear(year: number | null | undefined): number | null {
  if (!year) return null;
  const age = new Date().getFullYear() - year;
  return age >= 0 && age <= 130 ? age : null;
}

export function ageLabel(year: number | null | undefined): string | null {
  const age = ageFromBirthYear(year);
  if (age == null) return null;
  const mod10 = age % 10;
  const mod100 = age % 100;
  const word =
    mod10 === 1 && mod100 !== 11
      ? "год"
      : mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)
        ? "года"
        : "лет";
  return `${age} ${word}`;
}

const RATING_SOURCE_LABELS: Record<string, string> = {
  tennis67: "теннис67.рф",
  manual: "вручную",
  import: "импорт",
};

export function ratingSourceLabel(source: string): string {
  return RATING_SOURCE_LABELS[source] ?? source;
}

// Ссылка на профиль в Telegram по нормализованному username.
export function telegramUrl(username: string): string {
  return `https://t.me/${username.replace(/^@+/, "")}`;
}
