'use server'

import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'

import { OrderStatus } from '@/app/generated/prisma/client'
import { auth } from '@/lib/auth'
import { orderEmailTemplate, sendEmail, sendTelegram } from '@/lib/notifications'
import { prisma } from '@/lib/prisma'
import { fullOrderSchema, type OrderFormData } from '@/lib/validations/order'

export async function createOrder(data: OrderFormData) {
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
  await Promise.allSettled([
    notificationEmail
      ? sendEmail({
          to: notificationEmail,
          subject: `Новый заказ #${order.id} — ${order.fullName}`,
          html: orderEmailTemplate(order),
        })
      : Promise.resolve(),
    sendTelegram(
      `Новый заказ #${order.id}\n` +
        `Материал: ${order.material}, ${order.color}\n` +
        `Количество: ${order.quantity} шт. | Infill: ${order.infill}%\n` +
        `${!order.hasModel ? 'Нет 3D-модели (нужно моделирование)\n' : ''}` +
        `Доставка: ${order.delivery}`
    ),
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
