import { z } from "zod"

import { MAX_QUOTE_FILES } from "@/lib/attachments"

export const QUOTE_TYPES = ["MODELING", "SCANNING"] as const
export const MODELING_SOURCES = ["sketch", "photo", "drawing", "revise"] as const
export const SCAN_LOCATIONS = ["pickup", "bring", "onsite"] as const
export const DESIRED_FORMATS = ["STL", "OBJ", "STEP", "3MF", "PARAMETRIC", "OTHER"] as const

export const quoteDetailsSchema = z
  .object({
    type: z.enum(QUOTE_TYPES, { error: "Выберите тип услуги" }),
    description: z
      .string()
      .min(10, "Опишите задачу подробнее (минимум 10 символов)")
      .max(2000, "Описание не должно превышать 2000 символов"),
    desiredFormat: z.enum(DESIRED_FORMATS).optional(),

    // Modeling
    sourceType: z.enum(MODELING_SOURCES).optional(),

    // Scanning
    objectWidth: z.coerce.number().positive().max(10000).optional(),
    objectHeight: z.coerce.number().positive().max(10000).optional(),
    objectLength: z.coerce.number().positive().max(10000).optional(),
    location: z.enum(SCAN_LOCATIONS).optional(),
    needsReverse: z.boolean().optional().default(false),

    fullName: z.string().min(2, "Укажите ФИО").max(100),
    phone: z
      .string()
      .min(10, "Укажите телефон")
      .regex(/^\+?[0-9\s\-\(\)]{10,20}$/, "Неверный формат телефона"),
    email: z.string().email("Неверный email"),
    telegram: z.preprocess(
      (value) => {
        if (typeof value !== "string") return value
        const trimmed = value.trim()
        return trimmed === "" ? undefined : trimmed
      },
      z.string().max(64, "Максимум 64 символа").optional(),
    ),

    personalDataConsent: z
      .boolean()
      .refine((value) => value, "Необходимо согласие на обработку персональных данных"),
  })
  .refine(
    (data) =>
      data.type !== "MODELING" || (data.sourceType !== undefined && data.sourceType !== null),
    { message: "Выберите тип исходника", path: ["sourceType"] },
  )
  .refine(
    (data) =>
      data.type !== "SCANNING" || (data.location !== undefined && data.location !== null),
    { message: "Укажите расположение объекта", path: ["location"] },
  )

export const quoteSchema = quoteDetailsSchema.safeExtend({
  files: z.array(z.file()).max(MAX_QUOTE_FILES, `Максимум ${MAX_QUOTE_FILES} файлов`),
})

export type QuoteFormData = z.infer<typeof quoteSchema>
