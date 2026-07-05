import { z } from "zod";

// Инпуты координат отдают строки; допускаем запятую как десятичный разделитель.
// Пустая строка → null (а НЕ 0: Number("") === 0 увёл бы пикер в точку (0,0)).
export function parseCoord(v: string): number | null {
  const t = v.trim().replace(",", ".");
  if (t === "") return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

const coordField = (min: number, max: number, label: string) =>
  z
    .string()
    .trim()
    .min(1, "Укажите точку на карте или введите координату")
    .refine((v) => parseCoord(v) !== null, "Введите число")
    .refine((v) => {
      const n = parseCoord(v);
      return n === null || (n >= min && n <= max);
    }, `${label} — от ${min} до ${max}`);

const tablesField = z
  .string()
  .optional()
  .refine((v) => !v || /^\d{1,3}$/.test(v.trim()), "Введите целое число")
  .refine((v) => !v || Number(v) <= 500, "Не больше 500 столов");

export const createVenueSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Название слишком короткое — минимум 2 символа")
    .max(160, "Слишком длинное название — до 160 символов"),
  address: z
    .string()
    .trim()
    .min(3, "Адрес слишком короткий — минимум 3 символа")
    .max(300, "Слишком длинный адрес — до 300 символов"),
  description: z.string().trim().max(4000, "Слишком длинное описание — до 4000 символов").optional(),
  lat: coordField(-90, 90, "Широта"),
  lng: coordField(-180, 180, "Долгота"),
  tables_count: tablesField,
  phone: z.string().trim().max(20, "Слишком длинный телефон — до 20 символов").optional(),
  website: z
    .string()
    .trim()
    .max(300, "Слишком длинная ссылка — до 300 символов")
    .refine((v) => !v || (/\./.test(v) && !/\s/.test(v)), "Похоже, это не адрес сайта")
    .optional(),
  price_info: z.string().trim().max(2000, "Слишком длинное описание цен — до 2000 символов").optional(),
});

export type CreateVenueValues = z.infer<typeof createVenueSchema>;

export const VENUE_PHOTOS_MAX = 6;

export function validateVenuePhotoFile(file: File): string | null {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
    return "Формат не поддерживается — нужен JPEG, PNG или WebP";
  }
  return null;
}
