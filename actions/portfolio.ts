"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { portfolioSchema, type PortfolioFormData } from "@/lib/validations/portfolio"
import { revalidatePath } from "next/cache"

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session || session.user.email !== process.env.ADMIN_EMAIL) {
    throw new Error("Unauthorized")
  }
}

export async function getPortfolioItems(category?: string, published = true) {
  return prisma.portfolioItem.findMany({
    where: {
      ...(published ? { published: true } : {}),
      ...(category && category !== "all" ? { category } : {}),
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function createPortfolioItem(data: PortfolioFormData) {
  await requireAdmin()

  const parsed = portfolioSchema.safeParse(data)
  if (!parsed.success) return { error: "Ошибка валидации" }

  const { params, ...rest } = parsed.data
  const item = await prisma.portfolioItem.create({
    data: { ...rest, params: params as object | undefined },
  })
  revalidatePath("/portfolio")
  revalidatePath("/admin/portfolio")
  revalidatePath("/")
  return { item }
}

export async function updatePortfolioItem(id: string, data: PortfolioFormData) {
  await requireAdmin()

  const parsed = portfolioSchema.safeParse(data)
  if (!parsed.success) return { error: "Ошибка валидации" }

  const { params, ...rest } = parsed.data
  const item = await prisma.portfolioItem.update({
    where: { id },
    data: { ...rest, params: params as object | undefined },
  })
  revalidatePath("/portfolio")
  revalidatePath("/admin/portfolio")
  revalidatePath("/")
  return { item }
}

export async function deletePortfolioItem(id: string) {
  await requireAdmin()

  await prisma.portfolioItem.delete({ where: { id } })
  revalidatePath("/portfolio")
  revalidatePath("/admin/portfolio")
  revalidatePath("/")
  return { success: true }
}
