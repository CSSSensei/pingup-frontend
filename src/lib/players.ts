export function ageFromBirthDate(value: string | null | undefined): number | null {
  if (!value) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  const now = new Date();
  let age = now.getFullYear() - year;
  if (now.getMonth() + 1 < month || (now.getMonth() + 1 === month && now.getDate() < day)) {
    age -= 1;
  }
  return age >= 0 && age <= 130 ? age : null;
}

export function ageLabel(value: string | null | undefined): string | null {
  const age = ageFromBirthDate(value);
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
