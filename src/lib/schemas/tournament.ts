import { z } from "zod";

import { GENDERS, SKILL_LEVELS, TOURNAMENT_STATUSES } from "@/lib/enums";
import { moscowIso } from "@/lib/schemas/event";

const optionalEnum = (values: readonly [string, ...string[]]) =>
  z.union([z.enum([...values]), z.literal("")]);

const skillRank = (s: string) => SKILL_LEVELS.indexOf(s as (typeof SKILL_LEVELS)[number]);

const ratingField = z
  .string()
  .refine((v) => !v.trim() || /^\d{1,5}$/.test(v.trim()), "Введите рейтинг целым числом")
  .refine((v) => !v.trim() || Number(v) <= 32767, "Слишком большое значение");

const feeField = z
  .string()
  .refine(
    (v) => !v.trim() || /^\d{1,6}([.,]\d{1,2})?$/.test(v.trim()),
    "Введите взнос числом — например 300 или 250,50",
  );

const participantsField = z
  .string()
  .refine((v) => !v.trim() || /^\d{1,4}$/.test(v.trim()), "Введите целое число")
  .refine((v) => !v.trim() || Number(v) >= 2, "Минимум 2 участника")
  .refine((v) => !v.trim() || Number(v) <= 4096, "Не больше 4096 участников");

function bothOrNone(date: string, time: string): "ok" | "date" | "time" {
  if (!date && !time) return "ok";
  if (date && time) return "ok";
  return date ? "time" : "date";
}

export function buildTournamentFormSchema(opts: { requireFuture: boolean }) {
  return z
    .object({
      title: z
        .string()
        .trim()
        .min(3, "Название слишком короткое — минимум 3 символа")
        .max(200, "Слишком длинное название — до 200 символов"),
      description: z
        .string()
        .trim()
        .max(8000, "Слишком длинное описание — до 8000 символов")
        .optional(),
      venue_id: z.string(),
      start_date: z.string().min(1, "Укажите дату начала"),
      start_time: z.string().min(1, "Укажите время начала"),
      end_date: z.string(),
      end_time: z.string(),
      reg_date: z.string(),
      reg_time: z.string(),
      max_participants: participantsField,
      entry_fee: feeField,
      skill_min: optionalEnum(SKILL_LEVELS),
      skill_max: optionalEnum(SKILL_LEVELS),
      rating_min: ratingField,
      rating_max: ratingField,
      gender_restriction: optionalEnum(GENDERS),
      external_url: z
        .string()
        .trim()
        .max(500, "Слишком длинная ссылка — до 500 символов")
        .refine((v) => !v || /^https?:\/\/.+/.test(v), "Ссылка должна начинаться с http:// или https://"),
      status: optionalEnum(TOURNAMENT_STATUSES),
    })
    .superRefine((d, ctx) => {
      if (d.skill_min && d.skill_max && skillRank(d.skill_min) > skillRank(d.skill_max)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["skill_max"],
          message: "Уровень «до» не может быть ниже уровня «от»",
        });
      }
      if (d.rating_min.trim() && d.rating_max.trim() && Number(d.rating_min) > Number(d.rating_max)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["rating_max"],
          message: "Рейтинг «до» не может быть меньше «от»",
        });
      }

      const endMissing = bothOrNone(d.end_date, d.end_time);
      if (endMissing !== "ok") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [endMissing === "time" ? "end_time" : "end_date"],
          message: "Заполните дату и время окончания вместе",
        });
      }
      const regMissing = bothOrNone(d.reg_date, d.reg_time);
      if (regMissing !== "ok") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [regMissing === "time" ? "reg_time" : "reg_date"],
          message: "Заполните дату и время дедлайна вместе",
        });
      }

      if (!d.start_date || !d.start_time) return;
      const starts = Date.parse(moscowIso(d.start_date, d.start_time));
      if (Number.isNaN(starts)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["start_date"], message: "Некорректная дата" });
        return;
      }
      if (opts.requireFuture && starts <= Date.now()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["start_date"],
          message: "Турнир должен начинаться в будущем",
        });
      }
      if (endMissing === "ok" && d.end_date && d.end_time) {
        const ends = Date.parse(moscowIso(d.end_date, d.end_time));
        if (!Number.isNaN(ends) && ends <= starts) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["end_time"],
            message: "Окончание должно быть позже начала",
          });
        }
      }
      if (regMissing === "ok" && d.reg_date && d.reg_time) {
        const deadline = Date.parse(moscowIso(d.reg_date, d.reg_time));
        if (!Number.isNaN(deadline) && deadline > starts) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["reg_time"],
            message: "Дедлайн регистрации не может быть позже начала",
          });
        }
      }
    });
}

export type TournamentFormValues = z.infer<ReturnType<typeof buildTournamentFormSchema>>;
