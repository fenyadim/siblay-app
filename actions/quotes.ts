'use server'

import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { after } from 'next/server'

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
import { createRateLimiter, getClientId } from '@/lib/rate-limit'
import { deleteS3Object } from '@/lib/s3'
import { quoteSchema, type QuoteFormData } from '@/lib/validations/quote'

const quoteLimiter = createRateLimiter({
  limit: 5,
  windowMs: 60 * 60 * 1000,
  name: 'createQuote',
})

export async function createQuote(data: QuoteFormData) {
  const clientId = getClientId(await headers())
  const { allowed, retryAfter } = quoteLimiter(clientId)
  if (!allowed) {
    const minutes = Math.ceil(retryAfter / 60)
    return {
      error: `Слишком много заявок. Попробуйте через ${minutes} мин.`,
    }
  }

  const parsed = quoteSchema.safeParse(data)
  if (!parsed.success) {
    return { error: 'Ошибка валидации данных' }
  }

  const { files, personalDataConsent, ...rest } = parsed.data

  if (!personalDataConsent) {
    return { error: 'Требуется согласие на обработку персональных данных' }
  }

  // Поля, не относящиеся к выбранному типу услуги, очищаем перед записью,
  // чтобы не хранить «мусор» (например, габариты для MODELING).
  const cleanRest =
    rest.type === 'MODELING'
      ? {
          ...rest,
          objectWidth: undefined,
          objectHeight: undefined,
          objectLength: undefined,
          location: undefined,
          needsReverse: false,
        }
      : {
          ...rest,
          sourceType: undefined,
        }

  const quote = await prisma.quote.create({
    data: {
      ...cleanRest,
      files: {
        create: files.map((file) => ({
          fileName: file.fileName,
          fileUrl: file.fileUrl,
          fileType: file.fileType,
          fileSize: file.fileSize,
        })),
      },
    },
    include: { files: true },
  })

  const notificationEmail = process.env.NOTIFICATION_EMAIL
  const shortId = quote.id.slice(0, 8)

  const telegramResult = await Promise.allSettled([
    sendTelegram(adminQuoteTelegramText(quote), {
      parseMode: 'HTML',
      disableWebPagePreview: true,
    }),
  ])
  if (telegramResult[0].status === 'rejected') {
    console.error(`[quote:${shortId}] telegram-admin failed:`, telegramResult[0].reason)
  }

  after(async () => {
    const channels: Array<[string, Promise<unknown>]> = [
      [
        'email-customer',
        sendEmail({
          to: quote.email,
          subject: `Ваша заявка #${shortId} принята — Siblay`,
          html: customerQuoteEmailTemplate(quote),
        }),
      ],
    ]
    if (notificationEmail) {
      channels.push([
        'email-admin',
        sendEmail({
          to: notificationEmail,
          subject: `Новая заявка #${shortId} — ${quote.fullName}`,
          html: adminQuoteEmailTemplate(quote),
        }),
      ])
    }

    const results = await Promise.allSettled(channels.map(([, p]) => p))
    results.forEach((result, idx) => {
      const [name] = channels[idx]
      if (result.status === 'rejected') {
        console.error(`[quote:${shortId}] ${name} failed:`, result.reason)
      }
    })
  })

  return { quoteId: quote.id }
}

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

function s3KeyFromUrl(fileUrl: string): string | null {
  const region = process.env.AWS_REGION ?? 'ru1'
  const bucket = process.env.AWS_S3_BUCKET
  if (!bucket) return null
  const prefix = `https://s3.${region}.storage.beget.cloud/${bucket}/`
  return fileUrl.startsWith(prefix) ? fileUrl.slice(prefix.length) : null
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

  await Promise.allSettled(
    quote.files
      .map((f) => s3KeyFromUrl(f.fileUrl))
      .filter((key): key is string => key !== null)
      .map((key) => deleteS3Object(key)),
  )

  await prisma.quote.delete({ where: { id } })

  revalidatePath('/admin/quotes')
  revalidatePath('/admin')
  return { success: true }
}
