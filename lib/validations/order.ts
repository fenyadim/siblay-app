import { z } from "zod"

export const step1Schema = z.object({
  material: z
    .string({ error: "Выберите материал" })
    .min(1, "Выберите материал")
    .max(64),
}).passthrough()

export const step2Schema = z.object({
  color: z.string({ error: "Выберите цвет" }).min(1, "Выберите цвет"),
}).passthrough()

export const step3Schema = z.object({
  width: z.coerce
    .number({ error: "Введите число" })
    .positive("Укажите ширину")
    .max(1000, "Максимум 1000 мм"),
  height: z.coerce
    .number({ error: "Введите число" })
    .positive("Укажите высоту")
    .max(1000, "Максимум 1000 мм"),
  length: z.coerce
    .number({ error: "Введите число" })
    .positive("Укажите длину")
    .max(1000, "Максимум 1000 мм"),
  quantity: z.coerce
    .number()
    .int()
    .min(1, "Минимум 1 шт.")
    .max(1000, "Максимум 1000 шт."),
  infill: z.coerce.number().int().min(10).max(100),
}).passthrough()

export const step4Schema = z.object({
  hasModel: z.boolean(),
  files: z.array(z.file()),
}).passthrough()

export const step5Schema = z.object({
  comment: z.string().max(2000).optional(),
}).passthrough()

export const step6Schema = z.object({
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
  delivery: z.enum(["pickup", "courier", "sdek", "pochta"], "Выберите способ доставки"),
  address: z.string().optional(),
  personalDataConsent: z
    .boolean()
    .refine((value) => value, "Необходимо согласие на обработку персональных данных"),
}).passthrough().refine(
  (data) => data.delivery === "pickup" || (data.address && data.address.length > 5),
  { message: "Укажите адрес доставки", path: ["address"] },
)

export const orderDetailsSchema = step6Schema.safeExtend({
  ...step1Schema.shape,
  ...step2Schema.shape,
  ...step3Schema.shape,
  ...step5Schema.shape,
  hasModel: step4Schema.shape.hasModel,
}).strip()

export const fullOrderSchema = orderDetailsSchema.safeExtend({ files: step4Schema.shape.files })

export type OrderFormData = z.infer<typeof fullOrderSchema>
export type Step1Data = z.infer<typeof step1Schema>
export type Step2Data = z.infer<typeof step2Schema>
export type Step3Data = z.infer<typeof step3Schema>
export type Step4Data = z.infer<typeof step4Schema>
export type Step5Data = z.infer<typeof step5Schema>
export type Step6Data = z.infer<typeof step6Schema>
