import { revalidatePath } from 'next/cache'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createInquiry } from '@/actions/inquiries'
import { sendEmail, sendTelegram } from '@/lib/notifications'
import { type InquiryFormData, inquirySchema } from '@/lib/validations/inquiry'

const background = vi.hoisted(() => ({ tasks: [] as Array<() => Promise<void>> }))
const database = vi.hoisted(() => ({ create: vi.fn() }))

vi.mock('@/lib/prisma', () => ({ prisma: { order: { create: database.create } } }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('next/headers', () => ({ headers: async () => new Headers() }))
vi.mock('next/server', () => ({
  after: (task: () => Promise<void>) => background.tasks.push(task),
}))
vi.mock('@/lib/rate-limit', () => ({
  createRateLimiter: () => () => ({ allowed: true }),
  getClientId: () => 'test-client',
}))
vi.mock('@/lib/notifications', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/notifications')>()),
  sendEmail: vi.fn().mockResolvedValue(undefined),
  sendTelegram: vi.fn().mockResolvedValue(undefined),
}))

const inquiry: InquiryFormData = {
  fullName: 'Иван Иванов',
  phone: '+79991234567',
  email: 'customer@example.com',
  description: 'Нужна замена сломанной детали',
  personalDataConsent: true,
  files: [],
}

const file = {
  fileName: 'Деталь <1>.STP',
  fileUrl: 'https://s3.ru1.storage.beget.cloud/test/orders/model/123.stp',
  fileType: '', // Browsers may not supply a MIME type for CAD files.
  fileSize: 1024,
}

beforeEach(() => {
  vi.clearAllMocks()
  background.tasks = []
  vi.stubEnv('NOTIFICATION_EMAIL', 'manager@example.com')
  database.create.mockImplementation(async ({ data }) => ({
    id: 'saved-order-id',
    ...data,
    files: data.files.create,
  }))
})

afterEach(() => vi.unstubAllEnvs())

describe('простая заявка на заказ', () => {
  it('принимает заявку без вложений', async () => {
    expect(inquirySchema.parse({ ...inquiry, files: undefined }).files).toEqual([])
    expect(await createInquiry(inquiry)).toHaveProperty('inquiryId')
    expect(database.create).toHaveBeenCalledWith({
      data: {
        fullName: inquiry.fullName,
        phone: inquiry.phone,
        email: inquiry.email,
        comment: inquiry.description,
        hasModel: false,
        files: { create: [] },
      },
      include: { files: true },
    })
    expect(revalidatePath).toHaveBeenCalledWith('/admin/orders')
    expect(revalidatePath).toHaveBeenCalledWith('/admin')
    await Promise.all(background.tasks.map((task) => task()))
    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'manager@example.com',
        html: expect.stringContaining('Без вложений'),
      })
    )
  })

  it('передаёт фото и модели менеджеру с безопасными именами ссылок', async () => {
    const files = [
      file,
      { ...file, fileName: 'photo.jpg', fileType: 'image/jpeg' },
      { ...file, fileName: 'part.stl' },
    ]
    expect(await createInquiry({ ...inquiry, files })).toEqual({ inquiryId: 'saved-order-id' })
    expect(database.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ hasModel: true, files: { create: files } }),
      })
    )
    await Promise.all(background.tasks.map((task) => task()))
    const adminEmail = vi
      .mocked(sendEmail)
      .mock.calls.find(([message]) => message.to === 'manager@example.com')?.[0]
    expect(adminEmail?.html).toContain(`href="${file.fileUrl}"`)
    expect(adminEmail?.html).toContain('Деталь &lt;1&gt;.STP')
    expect(adminEmail?.html).toContain('photo.jpg')
    expect(adminEmail?.html).toContain('part.stl')
    expect(adminEmail?.html).toContain('/admin/orders/saved-order-id')
    expect(sendTelegram).toHaveBeenCalledWith(
      expect.stringContaining('Вложений: 3'),
      expect.anything()
    )
  })

  it.each([
    { ...file, fileName: 'script.svg' },
    { ...file, fileSize: 0 },
    { ...file, fileSize: 100 * 1024 * 1024 + 1 },
    { ...file, fileName: 'photo.png', fileSize: 20 * 1024 * 1024 + 1 },
    { ...file, fileUrl: 'https://example.com/model.stp' },
    { ...file, fileUrl: 'javascript:alert(1)' },
  ])('отклоняет недопустимый файл на сервере: %j', async (invalidFile) => {
    expect(await createInquiry({ ...inquiry, files: [invalidFile] })).toHaveProperty('error')
    expect(sendTelegram).not.toHaveBeenCalled()
    expect(database.create).not.toHaveBeenCalled()
    expect(background.tasks).toHaveLength(0)
  })

  it('ограничивает число вложений и требует согласие', async () => {
    expect(await createInquiry({ ...inquiry, files: Array(11).fill(file) })).toHaveProperty('error')
    expect(await createInquiry({ ...inquiry, personalDataConsent: false })).toHaveProperty('error')
    expect(sendTelegram).not.toHaveBeenCalled()
    expect(database.create).not.toHaveBeenCalled()
  })

  it('сохраняет фото без отметки о наличии 3D-модели', async () => {
    await createInquiry({ ...inquiry, files: [{ ...file, fileName: 'photo.jpg' }] })
    expect(database.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ hasModel: false }),
      })
    )
  })

  it('не подтверждает заказ и не отправляет уведомления при ошибке сохранения', async () => {
    database.create.mockRejectedValueOnce(new Error('Database unavailable'))
    await expect(createInquiry(inquiry)).rejects.toThrow('Database unavailable')
    expect(sendTelegram).not.toHaveBeenCalled()
    expect(sendEmail).not.toHaveBeenCalled()
    expect(revalidatePath).not.toHaveBeenCalled()
    expect(background.tasks).toHaveLength(0)
  })
})
