import { z } from "zod";

import { GENDERS, PLAYING_HANDS, SKILL_LEVELS } from "@/lib/enums";
import {
  validateBirthDate,
  validatePhone,
  validateTelegram,
  validateTennis67Url,
} from "@/lib/schemas/onboarding";

// <select> необязательного поля отдаёт "" — допускаем, на submit чистим в null.
const optionalEnum = (values: readonly [string, ...string[]]) =>
  z.union([z.enum([...values]), z.literal("")]);

// Профиль: зеркалит app/schemas/profile.py::ProfileUpdate.
// Формат-поля (год/telegram/phone/tennis67) валидируем теми же функциями, что и онбординг —
// одно сообщение об ошибке на клиенте, парность с бэкендом.
export const profileEditSchema = z
  .object({
    display_name: z
      .string()
      .trim()
      .min(2, "Имя слишком короткое — минимум 2 символа")
      .max(80, "Слишком длинное имя — до 80 символов"),
    bio: z.string().trim().max(2000, "Слишком длинное описание — до 2000 символов").optional(),
    gender: optionalEnum(GENDERS),
    skill_level: optionalEnum(SKILL_LEVELS),
    playing_hand: optionalEnum(PLAYING_HANDS),
    birth_date: z.string().trim().optional(),
    blade: z.string().trim().max(120, "Слишком длинно — до 120 символов").optional(),
    rubber_forehand: z.string().trim().max(120, "Слишком длинно — до 120 символов").optional(),
    rubber_backhand: z.string().trim().max(120, "Слишком длинно — до 120 символов").optional(),
    telegram_username: z.string().trim().optional(),
    phone: z.string().trim().max(20).optional(),
    phone_visible: z.boolean(),
    is_coach: z.boolean(),
    tennis67_url: z.string().trim().optional(),
  })
  .superRefine((d, ctx) => {
    const checks: [keyof typeof d, (v: string) => string | null][] = [
      ["birth_date", validateBirthDate],
      ["telegram_username", validateTelegram],
      ["phone", validatePhone],
      ["tennis67_url", validateTennis67Url],
    ];
    for (const [field, validate] of checks) {
      const msg = validate(String(d[field] ?? ""));
      if (msg) ctx.addIssue({ code: z.ZodIssueCode.custom, message: msg, path: [field] });
    }
    if (!d.telegram_username?.trim() && !d.phone?.trim()) {
      const msg = "Оставьте хотя бы один контакт — Telegram или телефон";
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: msg, path: ["telegram_username"] });
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: msg, path: ["phone"] });
    }
  });

export type ProfileEditValues = z.infer<typeof profileEditSchema>;
