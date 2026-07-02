import { z } from "zod";

export const reviewSchema = z.object({
  rating: z
    .number({ message: "Поставьте оценку" })
    .int()
    .min(1, "Поставьте оценку")
    .max(5, "Оценка от 1 до 5"),
  comment: z.string().trim().max(2000, "Слишком длинный отзыв — до 2000 символов").optional(),
});

export type ReviewFormValues = z.infer<typeof reviewSchema>;
