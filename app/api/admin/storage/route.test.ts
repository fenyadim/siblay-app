import { NextRequest } from 'next/server'
import { beforeEach, expect, it, vi } from 'vitest'

import { hasAdminSession } from '@/lib/admin-session'
import { uploadS3Object } from '@/lib/s3'
import { downloadStorageFile } from '@/lib/storage-admin'

import { GET, POST } from './route'

vi.mock('@/lib/admin-session', () => ({ hasAdminSession: vi.fn() }))
vi.mock('@/lib/s3', () => ({ uploadS3Object: vi.fn() }))
vi.mock('@/lib/storage-admin', async (importOriginal) => ({
  ...await importOriginal<typeof import('@/lib/storage-admin')>(),
  downloadStorageFile: vi.fn(),
}))
vi.mock('@/lib/prisma', () => ({ prisma: {} }))

const endpoint = 'https://example.com/api/admin/storage'

function uploadRequest(files: File[], allowUpload = true) {
  const body = new FormData()
  for (const file of files) body.append('file', file)
  return new NextRequest(endpoint, {
    method: 'POST',
    headers: allowUpload ? { 'X-Requested-With': 'XMLHttpRequest' } : {},
    body,
  })
}

beforeEach(() => {
  vi.resetAllMocks()
  vi.mocked(hasAdminSession).mockResolvedValue(true)
})

it('checks the admin session on uploads and downloads before touching S3', async () => {
  vi.mocked(hasAdminSession).mockResolvedValue(false)

  expect((await GET(new NextRequest(`${endpoint}?key=orders%2Fmodel.stl`))).status).toBe(401)
  expect((await POST(uploadRequest([new File(['data'], 'file.txt')]))).status).toBe(401)
  expect(uploadS3Object).not.toHaveBeenCalled()
  expect(downloadStorageFile).not.toHaveBeenCalled()
})

it('rejects cross-origin form submissions and requests with more than one file', async () => {
  const file = new File(['data'], 'file.txt')

  expect((await POST(uploadRequest([file], false))).status).toBe(403)
  expect((await POST(uploadRequest([file, file]))).status).toBe(400)
  expect(uploadS3Object).not.toHaveBeenCalled()
})

it('uploads manual files under a unique key and preserves Unicode names', async () => {
  const response = await POST(uploadRequest([new File(['data'], 'деталь #1.stl')]))
  expect(response.status).toBe(201)

  const { key } = await response.json()
  expect(key).toMatch(/^admin\/[^/]+\/деталь #1\.stl$/)
  expect(uploadS3Object).toHaveBeenCalledExactlyOnceWith(key, new TextEncoder().encode('data'), 'application/octet-stream')
})

it('streams the requested key as a download with a private cache policy', async () => {
  const stream = new Response('data').body
  vi.mocked(downloadStorageFile).mockResolvedValue({
    $metadata: {},
    Body: { transformToWebStream: () => stream } as Awaited<ReturnType<typeof downloadStorageFile>>['Body'],
    ContentLength: 4,
  })
  const key = 'admin/id/деталь #1.stl'
  const response = await GET(new NextRequest(`${endpoint}?${new URLSearchParams({ key })}`))

  expect(downloadStorageFile).toHaveBeenCalledExactlyOnceWith(key, expect.any(AbortSignal))
  expect(response.headers.get('content-disposition')).toContain(encodeURIComponent('деталь #1.stl'))
  expect(response.headers.get('cache-control')).toBe('private, no-store')
  expect(await response.text()).toBe('data')
})
