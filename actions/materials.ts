"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session || session.user.email !== process.env.ADMIN_EMAIL) {
    throw new Error("Unauthorized")
  }
}

export type MaterialWithColors = {
  id: string
  name: string
  description: string
  price: string
  color: string
  best: string
  available: boolean
  sortOrder: number
  colors: {
    id: string
    materialId: string
    name: string
    hex: string
    inStock: boolean
    sortOrder: number
  }[]
}

const SEED_MATERIALS = [
  {
    name: "PLA",
    description: "Стандартный, биоразлагаемый",
    price: "от 2 ₽/г",
    color: "#22c55e",
    best: "Прототипы, декор",
    available: true,
    sortOrder: 0,
    colors: [
      { name: "Белый", hex: "#F5F5F5", inStock: true, sortOrder: 0 },
      { name: "Чёрный", hex: "#1a1a1a", inStock: true, sortOrder: 1 },
      { name: "Серый", hex: "#9ca3af", inStock: true, sortOrder: 2 },
      { name: "Красный", hex: "#ef4444", inStock: true, sortOrder: 3 },
      { name: "Синий", hex: "#3b82f6", inStock: true, sortOrder: 4 },
      { name: "Зелёный", hex: "#22c55e", inStock: true, sortOrder: 5 },
      { name: "Жёлтый", hex: "#eab308", inStock: true, sortOrder: 6 },
      { name: "Оранжевый", hex: "#f97316", inStock: false, sortOrder: 7 },
      { name: "Фиолетовый", hex: "#a855f7", inStock: false, sortOrder: 8 },
      { name: "Натуральный", hex: "#e8d5b7", inStock: true, sortOrder: 9 },
    ],
  },
  {
    name: "PETG",
    description: "Гибкий, химстойкий",
    price: "от 3 ₽/г",
    color: "#3b82f6",
    best: "Пищевой контакт",
    available: true,
    sortOrder: 1,
    colors: [
      { name: "Прозрачный", hex: "#e0f2fe", inStock: true, sortOrder: 0 },
      { name: "Белый", hex: "#F5F5F5", inStock: true, sortOrder: 1 },
      { name: "Чёрный", hex: "#1a1a1a", inStock: true, sortOrder: 2 },
      { name: "Синий", hex: "#3b82f6", inStock: true, sortOrder: 3 },
      { name: "Зелёный", hex: "#22c55e", inStock: false, sortOrder: 4 },
      { name: "Красный", hex: "#ef4444", inStock: true, sortOrder: 5 },
    ],
  },
  {
    name: "TPU",
    description: "Гибкий, эластичный",
    price: "от 4 ₽/г",
    color: "#06b6d4",
    best: "Прокладки, чехлы",
    available: true,
    sortOrder: 2,
    colors: [
      { name: "Чёрный", hex: "#1a1a1a", inStock: true, sortOrder: 0 },
      { name: "Белый", hex: "#F5F5F5", inStock: true, sortOrder: 1 },
      { name: "Прозрачный", hex: "#e0f2fe", inStock: true, sortOrder: 2 },
      { name: "Красный", hex: "#ef4444", inStock: false, sortOrder: 3 },
      { name: "Синий", hex: "#3b82f6", inStock: false, sortOrder: 4 },
    ],
  },
  {
    name: "ABS",
    description: "Ударопрочный, термостойкий",
    price: "от 2.5 ₽/г",
    color: "#f97316",
    best: "Корпуса, детали",
    available: false,
    sortOrder: 3,
    colors: [
      { name: "Белый", hex: "#F5F5F5", inStock: true, sortOrder: 0 },
      { name: "Чёрный", hex: "#1a1a1a", inStock: true, sortOrder: 1 },
      { name: "Серый", hex: "#9ca3af", inStock: true, sortOrder: 2 },
      { name: "Красный", hex: "#ef4444", inStock: true, sortOrder: 3 },
      { name: "Синий", hex: "#3b82f6", inStock: true, sortOrder: 4 },
      { name: "Натуральный", hex: "#e8d5b7", inStock: true, sortOrder: 5 },
    ],
  },
  {
    name: "Nylon",
    description: "Износостойкий, инженерный",
    price: "от 4 ₽/г",
    color: "#a855f7",
    best: "Шестерёнки, петли",
    available: false,
    sortOrder: 4,
    colors: [
      { name: "Белый", hex: "#F5F5F5", inStock: true, sortOrder: 0 },
      { name: "Чёрный", hex: "#1a1a1a", inStock: true, sortOrder: 1 },
      { name: "Натуральный", hex: "#e8d5b7", inStock: true, sortOrder: 2 },
    ],
  },
  {
    name: "Resin",
    description: "Высокая детализация, SLA",
    price: "от 5 ₽/г",
    color: "#ec4899",
    best: "Фигурки, ювелирка",
    available: false,
    sortOrder: 5,
    colors: [
      { name: "Прозрачный", hex: "#e0f2fe", inStock: true, sortOrder: 0 },
      { name: "Белый", hex: "#F5F5F5", inStock: true, sortOrder: 1 },
      { name: "Чёрный", hex: "#1a1a1a", inStock: true, sortOrder: 2 },
      { name: "Серый", hex: "#9ca3af", inStock: true, sortOrder: 3 },
      { name: "Телесный", hex: "#f5cba7", inStock: true, sortOrder: 4 },
      { name: "Зелёный", hex: "#22c55e", inStock: true, sortOrder: 5 },
    ],
  },
]

export async function getMaterialsWithColors(): Promise<MaterialWithColors[]> {
  const materials = await prisma.material.findMany({
    include: { colors: { orderBy: { sortOrder: "asc" } } },
    orderBy: { sortOrder: "asc" },
  })

  // Auto-seed if any seed materials are missing
  if (materials.length < SEED_MATERIALS.length) {
    return seedMaterials()
  }

  return materials
}

export async function seedMaterials(): Promise<MaterialWithColors[]> {
  const results: MaterialWithColors[] = []

  for (const mat of SEED_MATERIALS) {
    const { colors, ...matData } = mat
    try {
      // upsert — safe under concurrent calls
      const record = await prisma.material.upsert({
        where: { name: matData.name },
        update: {},
        create: {
          ...matData,
          colors: { create: colors },
        },
        include: { colors: { orderBy: { sortOrder: "asc" } } },
      })
      results.push(record)
    } catch {
      // Already exists (race condition) — fetch it
      const existing = await prisma.material.findUnique({
        where: { name: matData.name },
        include: { colors: { orderBy: { sortOrder: "asc" } } },
      })
      if (existing) results.push(existing)
    }
  }

  return results
}

// ── Admin actions ────────────────────────────────────────────────────────────

export async function adminSeedMaterials() {
  await requireAdmin()
  await seedMaterials()
  revalidatePath("/admin/materials")
  revalidatePath("/order")
}

export async function createMaterial(data: {
  name: string
  description: string
  price: string
  color: string
  best: string
}) {
  await requireAdmin()
  const last = await prisma.material.findFirst({ orderBy: { sortOrder: "desc" } })
  const material = await prisma.material.create({
    data: { ...data, available: true, sortOrder: (last?.sortOrder ?? -1) + 1 },
    include: { colors: { orderBy: { sortOrder: "asc" } } },
  })
  revalidatePath("/admin/materials")
  revalidatePath("/order")
  return { material }
}

export async function updateMaterial(
  id: string,
  data: { name?: string; description?: string; price?: string; color?: string; best?: string; available?: boolean },
) {
  await requireAdmin()
  await prisma.material.update({ where: { id }, data })
  revalidatePath("/admin/materials")
  revalidatePath("/order")
}

export async function updateMaterialColor(
  id: string,
  data: { name?: string; hex?: string; inStock?: boolean },
) {
  await requireAdmin()
  await prisma.materialColor.update({ where: { id }, data })
  revalidatePath("/admin/materials")
  revalidatePath("/order")
}

export async function addMaterialColor(
  materialId: string,
  data: { name: string; hex: string; inStock: boolean },
) {
  await requireAdmin()
  const last = await prisma.materialColor.findFirst({
    where: { materialId },
    orderBy: { sortOrder: "desc" },
  })
  await prisma.materialColor.create({
    data: { ...data, materialId, sortOrder: (last?.sortOrder ?? -1) + 1 },
  })
  revalidatePath("/admin/materials")
  revalidatePath("/order")
}

export async function deleteMaterialColor(id: string) {
  await requireAdmin()
  await prisma.materialColor.delete({ where: { id } })
  revalidatePath("/admin/materials")
  revalidatePath("/order")
}
