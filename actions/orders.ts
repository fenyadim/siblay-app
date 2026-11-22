'use server'

import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'

import { OrderStatus } from '@/app/generated/prisma/client'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { deleteSubmissionAttachments } from '@/lib/s3'

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

export async function deleteOrder(id: string) {
  await requireAdmin()

  const order = await prisma.order.findUnique({
    where: { id },
    include: { files: true },
  })
  if (!order) {
    throw new Error('Заказ не найден')
  }

  await deleteSubmissionAttachments(order.files)
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
