import { z } from "zod";

// Зеркалит ReportCreate.reason: min_length=3, max_length=2000.
export const reportSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(3, "Опишите причину — минимум 3 символа")
    .max(2000, "Не длиннее 2000 символов"),
});

export type ReportFormValues = z.infer<typeof reportSchema>;

// Необязательный комментарий модератора при закрытии жалобы.
export const resolveSchema = z.object({
  resolution_note: z.string().trim().max(2000, "Не длиннее 2000 символов"),
});

export type ResolveFormValues = z.infer<typeof resolveSchema>;
