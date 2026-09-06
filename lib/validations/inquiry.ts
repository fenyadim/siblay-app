import { z } from 'zod'

import { inquiryFileError, MAX_INQUIRY_FILES } from '@/lib/inquiry-files'

export const inquiryFileSchema = z
  .object({
    fileName: z.string().min(1).max(255),
    fileUrl: z
      .string()
      .url()
      .max(2048)
      .regex(
        /^https:\/\/s3\.[a-z0-9-]+\.storage\.beget\.cloud\/[^/]+\/orders\/[^?#]+$/i,
        'Неверный URL файла'
      ),
    fileType: z.string().max(100),
    fileSize: z.number().int().positive(),
  })
  .superRefine((file, context) => {
    const error = inquiryFileError({ name: file.fileName, size: file.fileSize })
    if (error) context.addIssue({ code: 'custom', message: error, path: ['fileName'] })
  })

export type InquiryFile = z.infer<typeof inquiryFileSchema>

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
  files: z.array(inquiryFileSchema).max(MAX_INQUIRY_FILES, 'Максимум 10 файлов').default([]),
  personalDataConsent: z
    .boolean()
    .refine((value) => value, 'Необходимо согласие на обработку персональных данных'),
})

export type InquiryFormData = z.infer<typeof inquirySchema>
