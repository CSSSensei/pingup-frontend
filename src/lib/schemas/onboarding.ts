// Пустое значение = валидно (поля онбординга опциональны). Зеркалит app/schemas/profile.py.
const TELEGRAM_RE = /^[A-Za-z][A-Za-z0-9_]{4,31}$/;
const TENNIS67_HOSTS = ["теннис67.рф", "xn--67-mlcmya3ad.xn--p1ai"];

export function validateBirthYear(value: string): string | null {
  const v = value.trim();
  if (!v) return null;
  const n = Number(v);
  const max = new Date().getFullYear(); // динамический потолок — не протухает
  if (!Number.isInteger(n) || n < 1920 || n > max) return `Год рождения — между 1920 и ${max}`;
  return null;
}

export function validateTelegram(value: string): string | null {
  const handle = value.trim().replace(/^@+/, "");
  if (!handle) return null;
  if (!TELEGRAM_RE.test(handle)) return "5–32 символа: латиница, цифры, _, начинается с буквы";
  return null;
}

export function validateTennis67Url(value: string): string | null {
  const v = value.trim();
  if (!v) return null;
  let url: URL;
  try {
    url = new URL(v);
  } catch {
    return "Вставьте ссылку целиком, начиная с https://";
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return "Ссылка должна начинаться с https://";
  // Браузер отдаёт hostname в punycode для кириллических доменов — оба варианта в whitelist.
  const host = url.hostname.toLowerCase().replace(/^www\./, "");
  if (!TENNIS67_HOSTS.includes(host)) return "Ссылка должна вести на теннис67.рф";
  // Нужна именно ссылка на карточку игрока с ?sportsman=<id> (её парсит синк рейтинга).
  const sportsman = url.searchParams.get("sportsman");
  if (!sportsman || !/^\d+$/.test(sportsman)) {
    return "В ссылке нет id игрока — нужен …/personal.php?sportsman=9292";
  }
  return null;
}

// Ведущие 8/7 трактуются как код страны РФ.
export function formatRuPhone(input: string): string {
  let digits = input.replace(/\D/g, "");
  if (!digits) return "";
  if (digits[0] === "8") digits = "7" + digits.slice(1);
  else if (digits[0] !== "7") digits = "7" + digits;
  digits = digits.slice(0, 11);
  const d = digits.slice(1);
  let out = "+7";
  if (d.length > 0) out += ` (${d.slice(0, 3)}`;
  if (d.length >= 3) out += ")";
  if (d.length > 3) out += ` ${d.slice(3, 6)}`;
  if (d.length > 6) out += `-${d.slice(6, 8)}`;
  if (d.length > 8) out += `-${d.slice(8, 10)}`;
  return out;
}

export function validatePhone(value: string): string | null {
  const digits = value.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.length < 11) return "Введите номер полностью";
  // РФ-номер: код страны 7 + код зоны 3–9 (отсекает 0000…/7111… и подобное).
  if (!/^7[3-9]\d{9}$/.test(digits)) return "Проверьте номер телефона";
  return null;
}

export function validateAvatarFile(file: File): string | null {
  const MAX_BYTES = 4 * 1024 * 1024;
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return "Только JPG, PNG или WebP";
  if (file.size > MAX_BYTES) return "Файл больше 4 МБ";
  return null;
}
