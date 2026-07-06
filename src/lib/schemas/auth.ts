import { z } from "zod";

import { validatePhone, validateTelegram } from "@/lib/schemas/onboarding";

// Порядок .min-проверок важен: первый провалившийся чек — показанное сообщение.
export const strongPassword = z
  .string()
  .min(1, "Придумайте пароль")
  .min(8, "Пароль короткий — нужно минимум 8 символов")
  .max(128, "Слишком длинный пароль — до 128 символов")
  .regex(/\p{L}/u, "Добавьте хотя бы одну букву")
  .regex(/\d/, "Добавьте хотя бы одну цифру");

const CONTACT_REQUIRED_MSG = "Укажите хотя бы один контакт — Telegram или телефон";

export const registerSchema = z
  .object({
    display_name: z
      .string()
      .trim()
      .min(1, "Введите имя")
      .min(2, "Имя слишком короткое — минимум 2 символа")
      .max(80, "Имя слишком длинное — не больше 80 символов"),
    email: z
      .string()
      .trim()
      .min(1, "Введите email")
      .email("Проверьте email — кажется, есть опечатка. Нужен формат you@example.com"),
    password: strongPassword,
    telegram: z.string().trim().optional(),
    phone: z.string().trim().optional(),
    terms_accept: z.boolean().refine((v) => v === true, {
      message: "Нужно принять пользовательское соглашение",
    }),
    privacy_consent: z.boolean().refine((v) => v === true, {
      message: "Нужно согласие на обработку персональных данных",
    }),
    marketing: z.boolean().optional(),
  })
  .superRefine((d, ctx) => {
    const tgErr = validateTelegram(d.telegram ?? "");
    if (tgErr) ctx.addIssue({ code: z.ZodIssueCode.custom, message: tgErr, path: ["telegram"] });
    const phErr = validatePhone(d.phone ?? "");
    if (phErr) ctx.addIssue({ code: z.ZodIssueCode.custom, message: phErr, path: ["phone"] });
    if (!d.telegram?.trim() && !d.phone?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: CONTACT_REQUIRED_MSG, path: ["telegram"] });
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: CONTACT_REQUIRED_MSG, path: ["phone"] });
    }
  });

export type RegisterValues = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().trim().min(1, "Введите email").email("Проверьте email — нужен формат you@example.com"),
  password: z.string().min(1, "Введите пароль"),
});

export type LoginValues = z.infer<typeof loginSchema>;

export const passwordResetRequestSchema = z.object({
  email: z.string().trim().min(1, "Введите email").email("Проверьте email — нужен формат you@example.com"),
});

export type PasswordResetRequestValues = z.infer<typeof passwordResetRequestSchema>;

export const passwordResetConfirmSchema = z
  .object({
    password: strongPassword,
    confirmPassword: z.string().min(1, "Повторите пароль"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Пароли не совпадают",
    path: ["confirmPassword"],
  });

export type PasswordResetConfirmValues = z.infer<typeof passwordResetConfirmSchema>;
