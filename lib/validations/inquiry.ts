import { z } from 'zod'

export const inquirySchema = z.object({
  fullName: z.string().min(2, 'Укажите ФИО').max(100),
  phone: z
    .string()
    .min(10, 'Укажите телефон')
    .regex(/^\+?[0-9\s\-\(\)]{10,20}$/, 'Неверный формат телефона'),
  email: z.string().email('Неверный email'),
  telegram: z.preprocess((value) => {
    if (typeof value !== 'string') return value
    const trimmed = value.trim()
    return trimmed === '' ? undefined : trimmed
  }, z.string().max(64, 'Максимум 64 символа').optional()),
  description: z
    .string()
    .min(10, 'Опишите задачу подробнее (минимум 10 символов)')
    .max(2000, 'Описание не должно превышать 2000 символов'),
  personalDataConsent: z
    .boolean()
    .refine((value) => value, 'Необходимо согласие на обработку персональных данных'),
})

export type InquiryFormData = z.infer<typeof inquirySchema>
