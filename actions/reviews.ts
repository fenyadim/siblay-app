"use server"

import { revalidatePath } from "next/cache"
import { headers } from "next/headers"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { reviewSchema, type ReviewFormData } from "@/lib/validations/review"

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session || session.user.email !== process.env.ADMIN_EMAIL) {
    throw new Error("Unauthorized")
  }
}

export async function getPublishedReviews() {
  return prisma.review.findMany({
    where: { published: true },
    orderBy: { reviewDate: "desc" },
  })
}

export async function getAllReviews() {
  await requireAdmin()
  return prisma.review.findMany({
    orderBy: { reviewDate: "desc" },
  })
}

export async function createReview(data: ReviewFormData) {
  await requireAdmin()

  const parsed = reviewSchema.safeParse(data)
  if (!parsed.success) return { error: "Ошибка валидации" }

  const review = await prisma.review.create({ data: parsed.data })
  revalidatePath("/")
  revalidatePath("/admin/reviews")
  return { review }
}

export async function updateReview(id: string, data: ReviewFormData) {
  await requireAdmin()

  const parsed = reviewSchema.safeParse(data)
  if (!parsed.success) return { error: "Ошибка валидации" }

  const review = await prisma.review.update({
    where: { id },
    data: parsed.data,
  })
  revalidatePath("/")
  revalidatePath("/admin/reviews")
  return { review }
}

export async function deleteReview(id: string) {
  await requireAdmin()

  await prisma.review.delete({ where: { id } })
  revalidatePath("/")
  revalidatePath("/admin/reviews")
  return { success: true }
}
