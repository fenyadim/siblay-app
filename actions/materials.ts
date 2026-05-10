'use server'

import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session || session.user.email !== process.env.ADMIN_EMAIL) {
    throw new Error('Unauthorized')
  }
}

export type MaterialWithColors = {
  id: string
  name: string
  description: string
  price: string
  best: string
  available: boolean
  sortOrder: number
  fullName: string
  tempLimit: string
  strength: string
  longDesc: string
  props: string[]
  color: string
  colors: {
    id: string
    materialId: string
    name: string
    hex: string
    hex2?: string | null
    inStock: boolean
    sortOrder: number
  }[]
}

const SEED_MATERIALS = [
  {
    name: 'PLA',
    description: 'Стандартный, биоразлагаемый',
    price: '2',
    best: 'Прототипы, декор',
    available: true,
    sortOrder: 0,
    fullName: 'Polylactic Acid',
    tempLimit: 'до 60°C',
    strength: 'Средняя',
    longDesc: 'Лучший выбор для прототипов, декоративных изделий и учебных моделей. Легко печатается, экологичен, широкая цветовая палитра. Не подходит для горячих сред.',
    props: ['Лёгкий', 'Точный', 'Экологичный'],
    color: '#01aeda',
    colors: [
      { name: 'Белый', hex: '#F5F5F5', inStock: true, sortOrder: 0 },
      { name: 'Чёрный', hex: '#1a1a1a', inStock: true, sortOrder: 1 },
      { name: 'Серый', hex: '#9ca3af', inStock: true, sortOrder: 2 },
      { name: 'Красный', hex: '#ef4444', inStock: true, sortOrder: 3 },
      { name: 'Синий', hex: '#3b82f6', inStock: true, sortOrder: 4 },
      { name: 'Зелёный', hex: '#22c55e', inStock: true, sortOrder: 5 },
      { name: 'Жёлтый', hex: '#eab308', inStock: true, sortOrder: 6 },
      { name: 'Оранжевый', hex: '#f97316', inStock: false, sortOrder: 7 },
      { name: 'Фиолетовый', hex: '#a855f7', inStock: false, sortOrder: 8 },
      { name: 'Натуральный', hex: '#e8d5b7', inStock: true, sortOrder: 9 },
    ],
  },
  {
    name: 'PETG',
    description: 'Гибкий, химстойкий',
    price: '3',
    best: 'Пищевой контакт',
    available: true,
    sortOrder: 1,
    fullName: 'Polyethylene Terephthalate Glycol',
    tempLimit: 'до 80°C',
    strength: 'Высокая',
    longDesc: 'Сочетает прочность ABS и простоту PLA. Подходит для пищевого контакта, медицины, деталей под нагрузку. Химически стоек, слабо коробится.',
    props: ['Гибкий', 'Прозрачный', 'Химстойкий'],
    color: '#8100cc',
    colors: [
      { name: 'Прозрачный', hex: '#e0f2fe', inStock: true, sortOrder: 0 },
      { name: 'Белый', hex: '#F5F5F5', inStock: true, sortOrder: 1 },
      { name: 'Чёрный', hex: '#1a1a1a', inStock: true, sortOrder: 2 },
      { name: 'Синий', hex: '#3b82f6', inStock: true, sortOrder: 3 },
      { name: 'Зелёный', hex: '#22c55e', inStock: false, sortOrder: 4 },
      { name: 'Красный', hex: '#ef4444', inStock: true, sortOrder: 5 },
    ],
  },
  {
    name: 'TPU',
    description: 'Гибкий, эластичный',
    price: '4',
    best: 'Прокладки, чехлы',
    available: true,
    sortOrder: 2,
    fullName: 'Thermoplastic Polyurethane',
    tempLimit: 'до 80°C',
    strength: 'Эластичная',
    longDesc: 'Резиноподобный материал для прокладок, защитных чехлов, мягких деталей и изделий с амортизацией. Выдерживает многократный изгиб без трещин.',
    props: ['Эластичный', 'Ударостойкий', 'Гибкий'],
    color: '#0fe24f',
    colors: [
      { name: 'Чёрный', hex: '#1a1a1a', inStock: true, sortOrder: 0 },
      { name: 'Белый', hex: '#F5F5F5', inStock: true, sortOrder: 1 },
      { name: 'Прозрачный', hex: '#e0f2fe', inStock: true, sortOrder: 2 },
      { name: 'Красный', hex: '#ef4444', inStock: false, sortOrder: 3 },
      { name: 'Синий', hex: '#3b82f6', inStock: false, sortOrder: 4 },
    ],
  },
  {
    name: 'ABS',
    description: 'Ударопрочный, термостойкий',
    price: '2.5',
    best: 'Корпуса, детали',
    available: false,
    sortOrder: 3,
    fullName: 'Acrylonitrile Butadiene Styrene',
    tempLimit: 'до 100°C',
    strength: 'Высокая',
    longDesc: 'Классический инженерный пластик для функциональных деталей, корпусов и изделий под механическую нагрузку. Жёсткий, термостойкий, хорошо шлифуется.',
    props: ['Прочный', 'Термостойкий', 'Ударопрочный'],
    color: '#d34107',
    colors: [
      { name: 'Белый', hex: '#F5F5F5', inStock: true, sortOrder: 0 },
      { name: 'Чёрный', hex: '#1a1a1a', inStock: true, sortOrder: 1 },
      { name: 'Серый', hex: '#9ca3af', inStock: true, sortOrder: 2 },
      { name: 'Красный', hex: '#ef4444', inStock: true, sortOrder: 3 },
      { name: 'Синий', hex: '#3b82f6', inStock: true, sortOrder: 4 },
      { name: 'Натуральный', hex: '#e8d5b7', inStock: true, sortOrder: 5 },
    ],
  },
  {
    name: 'Nylon',
    description: 'Износостойкий, инженерный',
    price: '4',
    best: 'Шестерёнки, петли',
    available: false,
    sortOrder: 4,
    fullName: 'Polyamide',
    tempLimit: 'до 120°C',
    strength: 'Очень высокая',
    longDesc: 'Инженерный материал для шестерёнок, петель, деталей со скользящим контактом. Высокая усталостная прочность, износостойкий. Гигроскопичен, хранить в сухом месте.',
    props: ['Износостойкий', 'Гибкий', 'Прочный'],
    color: '#3551f1',
    colors: [
      { name: 'Белый', hex: '#F5F5F5', inStock: true, sortOrder: 0 },
      { name: 'Чёрный', hex: '#1a1a1a', inStock: true, sortOrder: 1 },
      { name: 'Натуральный', hex: '#e8d5b7', inStock: true, sortOrder: 2 },
    ],
  },
  {
    name: 'Resin',
    description: 'Высокая детализация, SLA',
    price: '5',
    best: 'Фигурки, ювелирка',
    available: false,
    sortOrder: 5,
    fullName: 'Фотополимер',
    tempLimit: 'до 60°C',
    strength: 'Средняя (хрупкая)',
    longDesc: 'SLA/LCD печать с точностью 0.05 мм для фигурок, ювелирных моделей, стоматологии и мелких деталей с тончайшими элементами. Идеальная поверхность без следов слоёв.',
    props: ['Высокая детализация', 'Гладкая поверхность', 'Точный'],
    color: '#a7a7a7',
    colors: [
      { name: 'Прозрачный', hex: '#e0f2fe', inStock: true, sortOrder: 0 },
      { name: 'Белый', hex: '#F5F5F5', inStock: true, sortOrder: 1 },
      { name: 'Чёрный', hex: '#1a1a1a', inStock: true, sortOrder: 2 },
      { name: 'Серый', hex: '#9ca3af', inStock: true, sortOrder: 3 },
      { name: 'Телесный', hex: '#f5cba7', inStock: true, sortOrder: 4 },
      { name: 'Зелёный', hex: '#22c55e', inStock: true, sortOrder: 5 },
    ],
  },
]

export async function getMaterialsWithColors(): Promise<MaterialWithColors[]> {
  return await prisma.material.findMany({
    // include: { colors: { orderBy: { sortOrder: 'asc' } } },
    include: { colors: { orderBy: { sortOrder: 'asc' } } },
    orderBy: { sortOrder: 'asc' },
  })
}

export async function getSeedMaterialsPreview(): Promise<MaterialWithColors[]> {
  return SEED_MATERIALS.map((material) => {
    const materialId = `seed-${material.name.toLowerCase()}`
    const { colors, ...rest } = material
    return {
      ...rest,
      id: materialId,
      colors: colors.map((c, index) => ({
        id: `${materialId}-${index}`,
        materialId,
        name: c.name,
        hex: c.hex,
        hex2: null,
        inStock: c.inStock,
        sortOrder: c.sortOrder,
      })),
    }
  })
}

async function seedMaterials(): Promise<MaterialWithColors[]> {
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
        include: { colors: { orderBy: { sortOrder: 'asc' } } },
      })
      results.push(record)
    } catch {
      // Already exists (race condition) — fetch it
      const existing = await prisma.material.findUnique({
        where: { name: matData.name },
        include: { colors: { orderBy: { sortOrder: 'asc' } } },
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
  revalidatePath('/admin/materials')
  revalidatePath('/order')
}

export async function createMaterial(data: {
  name: string
  description: string
  price: string
  best: string
}) {
  await requireAdmin()
  const last = await prisma.material.findFirst({ orderBy: { sortOrder: 'desc' } })
  const material = await prisma.material.create({
    data: { ...data, available: true, sortOrder: (last?.sortOrder ?? -1) + 1 },
    include: { colors: { orderBy: { sortOrder: 'asc' } } },
  })
  revalidatePath('/admin/materials')
  revalidatePath('/order')
  return { material }
}

export async function updateMaterial(
  id: string,
  data: {
    name?: string
    description?: string
    price?: string
    best?: string
    available?: boolean
    fullName?: string
    tempLimit?: string
    strength?: string
    longDesc?: string
    props?: string[]
    color?: string
  }
) {
  await requireAdmin()
  await prisma.material.update({ where: { id }, data })
  revalidatePath('/admin/materials')
  revalidatePath('/order')
}

export async function updateMaterialColor(
  id: string,
  data: { name?: string; hex?: string; hex2?: string | null; inStock?: boolean }
) {
  await requireAdmin()
  await prisma.materialColor.update({ where: { id }, data })
  revalidatePath('/admin/materials')
  revalidatePath('/order')
}

export async function addMaterialColor(
  materialId: string,
  data: { name: string; hex: string; hex2?: string; inStock: boolean }
) {
  await requireAdmin()
  const last = await prisma.materialColor.findFirst({
    where: { materialId },
    orderBy: { sortOrder: 'desc' },
  })
  await prisma.materialColor.create({
    data: { ...data, materialId, sortOrder: (last?.sortOrder ?? -1) + 1 },
  })
  revalidatePath('/admin/materials')
  revalidatePath('/order')
}

export async function deleteMaterialColor(id: string) {
  await requireAdmin()
  await prisma.materialColor.delete({ where: { id } })
  revalidatePath('/admin/materials')
  revalidatePath('/order')
}
