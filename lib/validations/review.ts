import { z } from "zod"

export const reviewSchema = z.object({
  authorName: z
    .string()
    .trim()
    .min(1, "Укажите имя автора")
    .max(100, "Максимум 100 символов"),
  reviewDate: z.coerce
    .date({ error: "Укажите дату отзыва" })
    .refine((d) => d.getTime() <= Date.now(), "Дата не может быть в будущем"),
  rating: z.coerce
    .number()
    .int("Оценка — целое число")
    .min(1, "Минимум 1")
    .max(5, "Максимум 5"),
  text: z
    .string()
    .trim()
    .min(1, "Введите текст отзыва")
    .max(2000, "Максимум 2000 символов"),
  sourceUrl: z.preprocess(
    (value) => {
      if (typeof value !== "string") return value
      const trimmed = value.trim()
      return trimmed === "" ? undefined : trimmed
    },
    z.string().url("Неверный URL").optional(),
  ),
  published: z.boolean().default(true),
})

export type ReviewFormData = z.infer<typeof reviewSchema>
