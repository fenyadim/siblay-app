'use server'

import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { after } from 'next/server'

import {
  adminInquiryEmailTemplate,
  adminInquiryTelegramText,
  customerInquiryEmailTemplate,
  sendEmail,
  sendTelegram,
} from '@/lib/notifications'
import { prisma } from '@/lib/prisma'
import { createRateLimiter, getClientId } from '@/lib/rate-limit'
import { type InquiryFormData, inquirySchema } from '@/lib/validations/inquiry'

const inquiryLimiter = createRateLimiter({
  limit: 5,
  windowMs: 60 * 60 * 1000,
  name: 'createInquiry',
})

export async function createInquiry(data: InquiryFormData) {
  const clientId = getClientId(await headers())
  const { allowed, retryAfter } = inquiryLimiter(clientId)
  if (!allowed) {
    const minutes = Math.ceil(retryAfter / 60)
    return {
      error: `Слишком много заявок. Попробуйте через ${minutes} мин.`,
    }
  }

  const parsed = inquirySchema.safeParse(data)
  if (!parsed.success) {
    return { error: 'Ошибка валидации данных' }
  }

  const { personalDataConsent, ...inquiryData } = parsed.data

  if (!personalDataConsent) {
    return { error: 'Требуется согласие на обработку персональных данных' }
  }

  const { description, files, ...contacts } = inquiryData
  const order = await prisma.order.create({
    data: {
      ...contacts,
      comment: description,
      hasModel: files.some((file) => /\.(stp|stl)$/i.test(file.fileName)),
      files: { create: files },
    },
    include: { files: true },
  })
  const inquiry = { ...order, description }
  revalidatePath('/admin/orders')
  revalidatePath('/admin')
  const notificationEmail = process.env.NOTIFICATION_EMAIL
  const shortId = inquiry.id.slice(0, 8)

  const telegramResult = await Promise.allSettled([
    sendTelegram(adminInquiryTelegramText(inquiry), {
      parseMode: 'HTML',
      disableWebPagePreview: true,
    }),
  ])
  if (telegramResult[0].status === 'rejected') {
    console.error(`[inquiry:${shortId}] telegram-admin failed:`, telegramResult[0].reason)
  }

  after(async () => {
    const channels: Array<[string, Promise<unknown>]> = [
      [
        'email-customer',
        sendEmail({
          to: inquiry.email,
          subject: `Ваша заявка #${shortId} принята — Siblay`,
          html: customerInquiryEmailTemplate(inquiry),
        }),
      ],
    ]
    if (notificationEmail) {
      channels.push([
        'email-admin',
        sendEmail({
          to: notificationEmail,
          subject: `Заявка на заказ #${shortId} — ${inquiry.fullName}`,
          html: adminInquiryEmailTemplate(inquiry),
        }),
      ])
    }

    const results = await Promise.allSettled(channels.map(([, p]) => p))
    results.forEach((result, idx) => {
      const [name] = channels[idx]
      if (result.status === 'rejected') {
        console.error(`[inquiry:${shortId}] ${name} failed:`, result.reason)
      }
    })
  })

  return { inquiryId: inquiry.id }
}
