import { z } from "zod";

import { strongPassword } from "@/lib/schemas/auth";

export const changeEmailSchema = z.object({
  new_email: z
    .string()
    .trim()
    .min(1, "Введите новый email")
    .email("Проверьте email — нужен формат you@example.com"),
  password: z.string().min(1, "Введите текущий пароль"),
});

export type ChangeEmailValues = z.infer<typeof changeEmailSchema>;

export const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, "Введите текущий пароль"),
    new_password: strongPassword,
    confirmPassword: z.string().min(1, "Повторите пароль"),
  })
  .refine((d) => d.new_password === d.confirmPassword, {
    message: "Пароли не совпадают",
    path: ["confirmPassword"],
  });

export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;
