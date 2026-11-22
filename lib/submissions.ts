import { after } from 'next/server'
import type { z } from 'zod'

import {
  adminOrderTelegramText,
  adminQuoteEmailTemplate,
  adminQuoteTelegramText,
  customerOrderEmailTemplate,
  customerQuoteEmailTemplate,
  orderEmailTemplate,
  sendEmail,
  sendTelegram,
} from '@/lib/notifications'
import { prisma } from '@/lib/prisma'
import type { orderDetailsSchema } from '@/lib/validations/order'
import type { quoteDetailsSchema } from '@/lib/validations/quote'

export type StoredAttachment = {
  fileName: string
  fileUrl: string
  fileType: string
  fileSize: number
}

export async function saveOrder(data: z.infer<typeof orderDetailsSchema>, files: StoredAttachment[]) {
  const { personalDataConsent: _consent, ...rest } = data
  return prisma.order.create({
    data: {
      ...rest,
      files: { create: files },
    },
    include: { files: true },
  })
}

export function notifyOrder(order: Awaited<ReturnType<typeof saveOrder>>) {
  const notificationEmail = process.env.NOTIFICATION_EMAIL
  const shortId = order.id.slice(0, 8)

  after(async () => {
    const channels: Array<[string, Promise<unknown>]> = [
      [
        'telegram-admin',
        sendTelegram(adminOrderTelegramText(order), {
          parseMode: 'HTML',
          disableWebPagePreview: true,
        }),
      ],
      [
        'email-customer',
        sendEmail({
          to: order.email,
          subject: `Ваш заказ #${shortId} принят — Siblay`,
          html: customerOrderEmailTemplate(order),
        }),
      ],
    ]
    if (notificationEmail) {
      channels.push([
        'email-admin',
        sendEmail({
          to: notificationEmail,
          subject: `Новый заказ #${shortId} — ${order.fullName}`,
          html: orderEmailTemplate(order),
        }),
      ])
    }

    const results = await Promise.allSettled(channels.map(([, p]) => p))
    results.forEach((result, idx) => {
      const [name] = channels[idx]
      if (result.status === 'rejected') {
        console.error(`[order:${shortId}] ${name} failed:`, result.reason)
      }
    })
  })
}

export async function saveQuote(data: z.infer<typeof quoteDetailsSchema>, files: StoredAttachment[]) {
  const { personalDataConsent: _consent, ...rest } = data
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

  return prisma.quote.create({
    data: {
      ...cleanRest,
      files: { create: files },
    },
    include: { files: true },
  })
}

export function notifyQuote(quote: Awaited<ReturnType<typeof saveQuote>>) {
  const notificationEmail = process.env.NOTIFICATION_EMAIL
  const shortId = quote.id.slice(0, 8)

  after(async () => {
    const channels: Array<[string, Promise<unknown>]> = [
      [
        'telegram-admin',
        sendTelegram(adminQuoteTelegramText(quote), {
          parseMode: 'HTML',
          disableWebPagePreview: true,
        }),
      ],
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
}
