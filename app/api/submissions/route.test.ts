import { NextRequest } from 'next/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { deleteS3Objects, uploadS3Object } from '@/lib/s3'
import { submitRequest } from '@/lib/submit-request'
import { notifyOrder, notifyQuote, saveOrder, saveQuote } from '@/lib/submissions'

import { POST } from './route'

vi.mock('@/lib/s3', () => ({
  deleteS3Objects: vi.fn(),
  getS3Url: (key: string) => `https://s3.twcstorage.ru/example/${key}`,
  uploadS3Object: vi.fn(),
}))

vi.mock('@/lib/submissions', () => ({
  saveOrder: vi.fn(),
  saveQuote: vi.fn(),
  notifyOrder: vi.fn(),
  notifyQuote: vi.fn(),
}))

const contact = {
  fullName: 'Иван Иванов',
  phone: '+79991234567',
  email: 'ivan@example.com',
  personalDataConsent: true,
}

const orderDetails = {
  ...contact,
  material: 'PLA',
  color: 'black',
  width: 10,
  height: 20,
  length: 30,
  quantity: 1,
  infill: 50,
  hasModel: true,
  delivery: 'pickup',
}

const quoteDetails = {
  ...contact,
  type: 'MODELING',
  sourceType: 'photo',
  description: 'Смоделировать корпус по фото',
}

function attachment(name = 'деталь.stl') {
  return new File(['file content'], name, { type: 'application/octet-stream' })
}

let client = 0

function request(kind: 'order' | 'quote', details: object, files: File[], signal?: AbortSignal) {
  const body = new FormData()
  body.set('details', JSON.stringify(details))
  for (const file of files) body.append('file', file)

  return new NextRequest(`https://example.com/api/submissions?kind=${kind}`, {
    method: 'POST',
    headers: { 'x-real-ip': `test-${++client}` },
    body,
    signal,
  })
}

describe('submitting customer attachments', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(deleteS3Objects).mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('uploads only the files still selected at submission and stores server-generated URLs', async () => {
    vi.mocked(saveOrder).mockImplementation(async () => ({ id: 'order-1' }) as Awaited<ReturnType<typeof saveOrder>>)
    vi.stubGlobal('fetch', async (url: string, init: ConstructorParameters<typeof NextRequest>[1]) => {
      return POST(new NextRequest(`https://example.com${url}`, init))
    })
    const draft = [attachment('убран.stl'), attachment()]
    const files = draft.slice(1)
    expect(uploadS3Object).not.toHaveBeenCalled()

    expect(await submitRequest('order', { ...orderDetails, files })).toEqual({ id: 'order-1' })

    expect(uploadS3Object).toHaveBeenCalledTimes(1)
    const [key, , contentType] = vi.mocked(uploadS3Object).mock.calls[0]
    expect(key).toMatch(/^orders\/.+\.stl$/)
    expect(contentType).toBe('application/sla')
    expect(saveOrder).toHaveBeenCalledWith(orderDetails, [{
      fileName: 'деталь.stl',
      fileSize: files[0].size,
      fileType: 'application/sla',
      fileUrl: `https://s3.twcstorage.ru/example/${key}`,
    }])
    expect(notifyOrder).toHaveBeenCalledOnce()
    expect(deleteS3Objects).not.toHaveBeenCalled()
  })

  it('validates the form before touching storage', async () => {
    const response = await POST(request('order', { ...orderDetails, delivery: 'courier' }, [attachment()]))

    expect(response.status).toBe(400)
    expect(uploadS3Object).not.toHaveBeenCalled()
    expect(saveOrder).not.toHaveBeenCalled()
  })

  it('removes uploaded files if a later attachment is rejected', async () => {
    const response = await POST(request('quote', quoteDetails, [attachment('photo.jpg'), attachment('bad.svg')]))

    expect(response.status).toBe(400)
    expect(uploadS3Object).toHaveBeenCalledTimes(1)
    expect(deleteS3Objects).toHaveBeenCalledWith([vi.mocked(uploadS3Object).mock.calls[0][0]])
    expect(saveQuote).not.toHaveBeenCalled()
  })

  it('removes both attempted objects after a failed S3 upload', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.mocked(uploadS3Object).mockResolvedValueOnce(undefined).mockRejectedValueOnce(new Error('S3 unavailable'))

    const response = await POST(request('quote', quoteDetails, [attachment('1.stl'), attachment('2.stl')]))

    expect(response.status).toBe(500)
    expect(deleteS3Objects).toHaveBeenCalledWith(vi.mocked(uploadS3Object).mock.calls.map(([key]) => key))
    expect(saveQuote).not.toHaveBeenCalled()
  })

  it('removes uploaded objects if saving the quote fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.mocked(saveQuote).mockRejectedValueOnce(new Error('Database unavailable'))
    const response = await POST(request('quote', quoteDetails, [attachment()]))

    expect(response.status).toBe(500)
    expect(deleteS3Objects).toHaveBeenCalledWith([vi.mocked(uploadS3Object).mock.calls[0][0]])
    expect(notifyQuote).not.toHaveBeenCalled()
  })

  it('removes uploaded objects when the request is cancelled before saving', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const controller = new AbortController()
    vi.mocked(uploadS3Object).mockImplementationOnce(async () => controller.abort())

    await POST(request('quote', quoteDetails, [attachment()], controller.signal))

    expect(deleteS3Objects).toHaveBeenCalledWith([vi.mocked(uploadS3Object).mock.calls[0][0]])
    expect(saveQuote).not.toHaveBeenCalled()
  })
})
