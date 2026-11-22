'use server'

import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'

import { QuoteStatus } from '@/app/generated/prisma/client'
import { auth } from '@/lib/auth'
import {
  adminQuoteEmailTemplate,
  adminQuoteTelegramText,
  customerQuoteEmailTemplate,
  sendEmail,
  sendTelegram,
} from '@/lib/notifications'
import { prisma } from '@/lib/prisma'
import { deleteSubmissionAttachments } from '@/lib/s3'

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session || session.user.email !== process.env.ADMIN_EMAIL) {
    throw new Error('Unauthorized')
  }
  return session
}

export async function updateQuotePrice(id: string, price: number | null) {
  await requireAdmin()

  const quote = await prisma.quote.update({
    where: { id },
    data: { estimatedPrice: price },
  })

  revalidatePath(`/admin/quotes/${id}`)
  revalidatePath('/admin/quotes')
  revalidatePath('/admin')
  return quote
}

export async function updateQuoteStatus(id: string, status: QuoteStatus) {
  await requireAdmin()

  const quote = await prisma.quote.update({
    where: { id },
    data: { status },
  })

  revalidatePath('/admin/quotes')
  revalidatePath(`/admin/quotes/${id}`)
  return quote
}

export async function deleteQuote(id: string) {
  await requireAdmin()

  const quote = await prisma.quote.findUnique({
    where: { id },
    include: { files: true },
  })
  if (!quote) {
    throw new Error('Заявка не найдена')
  }

  await deleteSubmissionAttachments(quote.files)
  await prisma.quote.delete({ where: { id } })

  revalidatePath('/admin/quotes')
  revalidatePath('/admin')
  return { success: true }
}
