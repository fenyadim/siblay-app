import { PrismaClient } from "../app/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { auth } from "../lib/auth"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const portfolioItems = [
  {
    title: "Корпус для электроники",
    description: "Прочный корпус для Arduino Mega с отверстиями для разъёмов и вентиляции. Материал: PETG серый.",
    category: "prototypes",
    material: "PETG",
    images: [
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80",
    ],
    params: { "Размер": "120×80×40 мм", "Заполнение": "30%", "Слой": "0.2 мм" },
    published: true,
  },
  {
    title: "Кронштейн для камеры",
    description: "Лёгкий кронштейн для экшн-камеры с возможностью регулировки угла. Печать из нейлона.",
    category: "parts",
    material: "Nylon",
    images: [
      "https://images.unsplash.com/photo-1580983559367-0dc2f8934365?w=800&q=80",
    ],
    params: { "Размер": "60×40×25 мм", "Заполнение": "50%" },
    published: true,
  },
  {
    title: "Фигурка дракона",
    description: "Декоративная фигурка дракона с детализированной чешуёй. Печать из PLA белого цвета с ручной покраской.",
    category: "figures",
    material: "PLA",
    images: [
      "https://images.unsplash.com/photo-1617802690992-15d93263d3a9?w=800&q=80",
    ],
    params: { "Высота": "150 мм", "Заполнение": "15%", "Поддержки": "да" },
    published: true,
  },
  {
    title: "Макет здания",
    description: "Архитектурный макет жилого дома масштаб 1:100. Сборная конструкция из нескольких частей.",
    category: "architecture",
    material: "PLA",
    images: [
      "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80",
    ],
    params: { "Масштаб": "1:100", "Заполнение": "10%", "Слой": "0.1 мм" },
    published: true,
  },
  {
    title: "Шестерня редуктора",
    description: "Прецизионная шестерня для промышленного редуктора. Материал ABS с высокой точностью печати.",
    category: "industrial",
    material: "ABS",
    images: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
    ],
    params: { "Диаметр": "80 мм", "Модуль": "2", "Заполнение": "80%" },
    published: true,
  },
  {
    title: "Прототип ручки",
    description: "Эргономичная ручка для инструмента, созданная по фотографиям заказчика. Материал PETG чёрный.",
    category: "prototypes",
    material: "PETG",
    images: [
      "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&q=80",
    ],
    params: { "Длина": "140 мм", "Заполнение": "40%" },
    published: true,
  },
]

async function main() {
  console.log("🌱 Начинаем seed...")

  // Create portfolio items
  console.log("📦 Создаём элементы портфолио...")
  await prisma.portfolioItem.deleteMany()
  for (const item of portfolioItems) {
    await prisma.portfolioItem.create({ data: item })
  }
  console.log(`✅ Создано ${portfolioItems.length} элементов портфолио`)

  // Create admin user
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@siblay.ru"
  const adminPassword = process.env.ADMIN_PASSWORD ?? "changeme123"

  console.log(`👤 Создаём admin пользователя (${adminEmail})...`)

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({ where: { email: adminEmail } })
  if (existingUser) {
    console.log("ℹ️  Admin пользователь уже существует, пропускаем")
  } else {
    await auth.api.signUpEmail({
      body: {
        email: adminEmail,
        password: adminPassword,
        name: "Admin",
      },
    })
    console.log(`✅ Admin создан: ${adminEmail}`)
  }

  console.log("🎉 Seed завершён!")
}

main()
  .catch((e) => {
    console.error("❌ Seed ошибка:", e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
