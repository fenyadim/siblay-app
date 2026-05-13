'use server'

import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'

import { OrderStatus } from '@/app/generated/prisma/client'
import { auth } from '@/lib/auth'
import {
  adminOrderTelegramText,
  customerOrderEmailTemplate,
  orderEmailTemplate,
  sendEmail,
  sendTelegram,
} from '@/lib/notifications'
import { prisma } from '@/lib/prisma'
import { createRateLimiter, getClientId } from '@/lib/rate-limit'
import { deleteS3Object } from '@/lib/s3'
import { fullOrderSchema, type OrderFormData } from '@/lib/validations/order'

const orderLimiter = createRateLimiter({
  limit: 5,
  windowMs: 60 * 60 * 1000,
  name: 'createOrder',
})

export async function createOrder(data: OrderFormData) {
  const clientId = getClientId(await headers())
  const { allowed, retryAfter } = orderLimiter(clientId)
  if (!allowed) {
    const minutes = Math.ceil(retryAfter / 60)
    return {
      error: `Слишком много заявок. Попробуйте через ${minutes} мин.`,
    }
  }

  const parsed = fullOrderSchema.safeParse(data)
  if (!parsed.success) {
    return { error: 'Ошибка валидации данных' }
  }

  const { files, personalDataConsent, ...rest } = parsed.data

  if (!personalDataConsent) {
    return { error: 'Требуется согласие на обработку персональных данных' }
  }

  const order = await prisma.order.create({
    data: {
      ...rest,
      estimatedPrice: undefined,
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
  const shortId = order.id.slice(0, 8)
  await Promise.allSettled([
    notificationEmail
      ? sendEmail({
          to: notificationEmail,
          subject: `Новый заказ #${shortId} — ${order.fullName}`,
          html: orderEmailTemplate(order),
        })
      : Promise.resolve(),
    sendTelegram(adminOrderTelegramText(order), {
      parseMode: 'HTML',
      disableWebPagePreview: true,
    }),
    sendEmail({
      to: order.email,
      subject: `Ваш заказ #${shortId} принят — Siblay`,
      html: customerOrderEmailTemplate(order),
    }),
  ])

  return { orderId: order.id }
}

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session || session.user.email !== process.env.ADMIN_EMAIL) {
    throw new Error('Unauthorized')
  }
  return session
}

export async function updateOrderPrice(id: string, price: number | null) {
  await requireAdmin()

  const order = await prisma.order.update({
    where: { id },
    data: { estimatedPrice: price },
  })

  revalidatePath(`/admin/orders/${id}`)
  revalidatePath('/admin/orders')
  revalidatePath('/admin')
  return order
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  await requireAdmin()

  const order = await prisma.order.update({
    where: { id },
    data: { status },
  })

  revalidatePath('/admin/orders')
  revalidatePath(`/admin/orders/${id}`)
  return order
}

function s3KeyFromUrl(fileUrl: string): string | null {
  const region = process.env.AWS_REGION ?? 'ru1'
  const bucket = process.env.AWS_S3_BUCKET
  if (!bucket) return null
  const prefix = `https://s3.${region}.storage.beget.cloud/${bucket}/`
  return fileUrl.startsWith(prefix) ? fileUrl.slice(prefix.length) : null
}

export async function deleteOrder(id: string) {
  await requireAdmin()

  const order = await prisma.order.findUnique({
    where: { id },
    include: { files: true },
  })
  if (!order) {
    throw new Error('Заказ не найден')
  }

  // Best-effort S3 cleanup; DB deletion proceeds even if some objects fail.
  await Promise.allSettled(
    order.files
      .map((f) => s3KeyFromUrl(f.fileUrl))
      .filter((key): key is string => key !== null)
      .map((key) => deleteS3Object(key))
  )

  await prisma.order.delete({ where: { id } })

  revalidatePath('/admin/orders')
  revalidatePath('/admin')
  return { success: true }
}

export async function getOrders(status?: OrderStatus) {
  await requireAdmin()

  return prisma.order.findMany({
    where: status ? { status } : undefined,
    include: { files: true },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getOrderById(id: string) {
  await requireAdmin()

  return prisma.order.findUnique({
    where: { id },
    include: { files: true },
  })
}
