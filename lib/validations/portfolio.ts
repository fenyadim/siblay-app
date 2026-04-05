import { z } from "zod"

export const portfolioSchema = z.object({
  title: z.string().min(2, "Укажите название").max(100),
  description: z.string().max(1000).optional(),
  category: z.enum(
    ["prototypes", "parts", "figures", "architecture", "industrial"],
    "Выберите категорию",
  ),
  material: z.string().min(1, "Укажите материал"),
  images: z.array(z.string().url()).min(1, "Добавьте хотя бы одно изображение"),
  params: z.record(z.string(), z.string()).optional(),
  published: z.boolean().default(true),
})

export type PortfolioFormData = z.infer<typeof portfolioSchema>

export const PORTFOLIO_CATEGORIES = [
  { value: "prototypes", label: "Прототипы" },
  { value: "parts", label: "Детали" },
  { value: "figures", label: "Фигурки" },
  { value: "architecture", label: "Архитектура" },
  { value: "industrial", label: "Промышленность" },
] as const

export const PORTFOLIO_CATEGORY_LABELS: Record<string, string> = {
  prototypes: "Прототипы",
  parts: "Детали",
  figures: "Фигурки",
  architecture: "Архитектура",
  industrial: "Промышленность",
}
