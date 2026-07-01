import { z } from "zod";

import { EVENT_TYPES, GENDERS, SKILL_LEVELS } from "@/lib/enums";

// <select> для необязательного поля отдаёт "" — допускаем его в схеме, а на submit чистим в undefined.
const optionalEnum = (values: readonly [string, ...string[]]) =>
  z.union([z.enum([...values]), z.literal("")]);

// Порядок SKILL_LEVELS = возрастание уровня → индекс работает как ранг.
const skillRank = (s: string) => SKILL_LEVELS.indexOf(s as (typeof SKILL_LEVELS)[number]);

// <input type="number"> отдаёт строку; пусто = не указано, иначе целое 0..32767.
const ratingField = z
  .string()
  .optional()
  .refine((v) => !v || /^\d{1,5}$/.test(v.trim()), "Введите целое число")
  .refine((v) => !v || Number(v) <= 32767, "Слишком большое значение");

export const createPartnerRequestSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, "Заголовок слишком короткий — минимум 3 символа")
      .max(160, "Слишком длинный заголовок — до 160 символов"),
    description: z.string().trim().max(4000, "Слишком длинное описание — до 4000 символов").optional(),
    desired_skill_min: optionalEnum(SKILL_LEVELS),
    desired_skill_max: optionalEnum(SKILL_LEVELS),
    desired_rating_min: ratingField,
    desired_rating_max: ratingField,
    desired_gender: optionalEnum(GENDERS),
    event_type: optionalEnum(EVENT_TYPES),
  })
  .refine(
    (d) =>
      !d.desired_skill_min ||
      !d.desired_skill_max ||
      skillRank(d.desired_skill_min) <= skillRank(d.desired_skill_max),
    { message: "Минимальный уровень выше максимального", path: ["desired_skill_max"] },
  )
  .refine(
    (d) =>
      !d.desired_rating_min ||
      !d.desired_rating_max ||
      Number(d.desired_rating_min) <= Number(d.desired_rating_max),
    { message: "Минимальный рейтинг выше максимального", path: ["desired_rating_max"] },
  );

export type CreatePartnerRequestValues = z.infer<typeof createPartnerRequestSchema>;
