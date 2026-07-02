import { z } from "zod";

import { GENDERS, SKILL_LEVELS } from "@/lib/enums";

export const TRAINING_TYPES = ["group_training", "personal_sparring"] as const;
export const GAME_FORMATS = ["singles", "doubles"] as const;

const optionalEnum = (values: readonly [string, ...string[]]) =>
  z.union([z.enum([...values]), z.literal("")]);

// Порядок SKILL_LEVELS = возрастание уровня → индекс работает как ранг.
const skillRank = (s: string) => SKILL_LEVELS.indexOf(s as (typeof SKILL_LEVELS)[number]);

// Весь сайт живёт по Москве (см. lib/format) — ввод интерпретируем так же.
// У Москвы нет DST с 2014-го, поэтому фиксированный +03:00 корректен всегда.
export function moscowIso(date: string, time: string): string {
  return `${date}T${time}:00+03:00`;
}

const moscowDateFmt = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/Moscow",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});
const moscowTimeFmt = new Intl.DateTimeFormat("ru-RU", {
  timeZone: "Europe/Moscow",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export function isoToMoscowDate(iso: string): string {
  return moscowDateFmt.format(new Date(iso));
}

export function isoToMoscowTime(iso: string): string {
  return moscowTimeFmt.format(new Date(iso));
}

const participantsField = z
  .string()
  .refine((v) => !v.trim() || /^\d{1,4}$/.test(v.trim()), "Введите целое число")
  .refine((v) => !v.trim() || Number(v) >= 2, "Минимум 2 — организатор уже занимает место")
  .refine((v) => !v.trim() || Number(v) <= 1000, "Не больше 1000 участников");

const priceField = z
  .string()
  .refine(
    (v) => !v.trim() || /^\d{1,6}([.,]\d{1,2})?$/.test(v.trim()),
    "Введите цену числом — например 300 или 250,50",
  );

export function buildEventFormSchema(opts: { requireFuture: boolean }) {
  return z
    .object({
      title: z
        .string()
        .trim()
        .min(3, "Название слишком короткое — минимум 3 символа")
        .max(160, "Слишком длинное название — до 160 символов"),
      description: z
        .string()
        .trim()
        .max(4000, "Слишком длинное описание — до 4000 символов")
        .optional(),
      training_type: z.enum([...TRAINING_TYPES]),
      game_format: z.enum([...GAME_FORMATS]),
      coach_id: z.string(),
      venue_id: z.string(),
      location_text: z.string().trim().max(300, "Слишком длинный адрес — до 300 символов"),
      date: z.string().min(1, "Укажите дату"),
      time_start: z.string().min(1, "Укажите время начала"),
      time_end: z.string(),
      max_participants: participantsField,
      min_skill: optionalEnum(SKILL_LEVELS),
      max_skill: optionalEnum(SKILL_LEVELS),
      gender_restriction: optionalEnum(GENDERS),
      price: priceField,
      is_public: z.boolean(),
    })
    .superRefine((d, ctx) => {
      if (!d.venue_id && !d.location_text.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["location_text"],
          message: "Выберите зал или укажите место встречи",
        });
      }
      if (d.min_skill && d.max_skill && skillRank(d.min_skill) > skillRank(d.max_skill)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["max_skill"],
          message: "Уровень «до» не может быть ниже уровня «от»",
        });
      }
      if (d.date && d.time_start) {
        const starts = Date.parse(moscowIso(d.date, d.time_start));
        if (Number.isNaN(starts)) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["date"], message: "Некорректная дата" });
          return;
        }
        if (opts.requireFuture && starts <= Date.now()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["date"],
            message: "Событие должно начинаться в будущем",
          });
        }
        if (d.time_end) {
          const ends = Date.parse(moscowIso(d.date, d.time_end));
          if (!Number.isNaN(ends) && ends <= starts) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["time_end"],
              message: "Окончание должно быть позже начала",
            });
          }
        }
      }
    });
}

export type EventFormValues = z.infer<ReturnType<typeof buildEventFormSchema>>;
