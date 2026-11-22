import { beforeEach, describe, expect, it, vi } from 'vitest'

import { hasCurrentAdminSession } from '@/lib/admin-session'
import { deleteS3Object } from '@/lib/s3'
import { findStorageReferences, headStorageFile } from '@/lib/storage-admin'

import { deleteStorageFile } from './storage'

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('@/lib/admin-session', () => ({ hasCurrentAdminSession: vi.fn() }))
vi.mock('@/lib/s3', () => ({ deleteS3Object: vi.fn() }))
vi.mock('@/lib/storage-admin', async (importOriginal) => ({
  ...await importOriginal<typeof import('@/lib/storage-admin')>(),
  findStorageReferences: vi.fn(),
  headStorageFile: vi.fn(),
}))
vi.mock('@/lib/prisma', () => ({ prisma: {} }))

const key = 'orders/id/file.stl'
const etag = '"abc123"'

describe('S3 deletion in the admin panel', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(hasCurrentAdminSession).mockResolvedValue(true)
    vi.mocked(findStorageReferences).mockResolvedValue(new Map())
    vi.mocked(headStorageFile).mockResolvedValue({
      $metadata: {},
      ETag: etag,
      LastModified: new Date('2025-01-01'),
    })
  })

  it('rejects deletion outside an admin session', async () => {
    vi.mocked(hasCurrentAdminSession).mockResolvedValue(false)

    expect(await deleteStorageFile(key, etag)).toHaveProperty('error')
    expect(findStorageReferences).not.toHaveBeenCalled()
    expect(deleteS3Object).not.toHaveBeenCalled()
  })

  it('protects objects still referenced by the site', async () => {
    vi.mocked(findStorageReferences).mockResolvedValue(new Map([
      [key, { label: 'Заказ', href: '/admin/orders/123' }],
    ]))

    expect(await deleteStorageFile(key, etag)).toHaveProperty('error')
    expect(headStorageFile).not.toHaveBeenCalled()
    expect(deleteS3Object).not.toHaveBeenCalled()
  })

  it('rejects stale ETags and recent uploads from forms', async () => {
    expect(await deleteStorageFile(key, '"old123"')).toHaveProperty('error')
    vi.mocked(headStorageFile).mockResolvedValue({ $metadata: {}, ETag: etag, LastModified: new Date() })
    expect(await deleteStorageFile(key, etag)).toHaveProperty('error')
    expect(deleteS3Object).not.toHaveBeenCalled()
  })

  it('deletes an unreferenced object whose ETag still matches', async () => {
    expect(await deleteStorageFile(key, etag)).toEqual({ success: true })
    expect(deleteS3Object).toHaveBeenCalledExactlyOnceWith(key)
  })
})
