import { GetObjectCommand, HeadObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3'

import { prisma } from '@/lib/prisma'
import { getS3Bucket, getS3Url, s3 } from '@/lib/s3'

const PAGE_SIZE = 50
const UPLOAD_GRACE_MS = 15 * 60 * 1000

export function isS3Key(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0 && Buffer.byteLength(value) <= 1024
}

export function isRecentAppUpload(key: string, lastModified: Date | undefined) {
  const appUpload = key.startsWith('orders/') || key.startsWith('portfolio/')
  return appUpload && (!lastModified || Date.now() - lastModified.getTime() < UPLOAD_GRACE_MS)
}

function storageFileUrl(key: string) {
  return getS3Url(key.split('/').map(encodeURIComponent).join('/'))
}

export async function findStorageReferences(keys: string[]) {
  const references = new Map<string, { label: string; href: string }>()
  if (!keys.length) return references

  const keysByUrl = new Map<string, string>()
  for (const key of keys) {
    keysByUrl.set(getS3Url(key), key)
    keysByUrl.set(storageFileUrl(key), key)
  }
  const urls = [...keysByUrl.keys()]
  const [orders, quotes, portfolio] = await Promise.all([
    prisma.orderFile.findMany({
      where: { fileUrl: { in: urls } },
      select: { fileUrl: true, orderId: true },
    }),
    prisma.quoteFile.findMany({
      where: { fileUrl: { in: urls } },
      select: { fileUrl: true, quoteId: true },
    }),
    prisma.portfolioItem.findMany({
      where: { images: { hasSome: urls } },
      select: { images: true },
    }),
  ])

  const add = (url: string, label: string, href: string) => {
    const key = keysByUrl.get(url)
    if (key && !references.has(key)) references.set(key, { label, href })
  }
  for (const file of orders) add(file.fileUrl, 'Заказ', `/admin/orders/${file.orderId}`)
  for (const file of quotes) add(file.fileUrl, 'Заявка', `/admin/quotes/${file.quoteId}`)
  for (const item of portfolio) {
    for (const url of item.images) add(url, 'Портфолио', '/admin/portfolio')
  }

  return references
}

export async function listStorageFiles(prefix?: string, cursor?: string) {
  const bucket = getS3Bucket()
  const result = await s3.send(new ListObjectsV2Command({
    Bucket: bucket,
    Prefix: prefix,
    ContinuationToken: cursor,
    MaxKeys: PAGE_SIZE,
    EncodingType: 'url',
  }))

  const objects = (result.Contents ?? []).flatMap((object) => {
    if (object.Key === undefined) return []
    // Request URL encoding so keys with XML control characters are still listed.
    const key = result.EncodingType === 'url' ? decodeURIComponent(object.Key) : object.Key
    return [{ key, size: object.Size, lastModified: object.LastModified, etag: object.ETag }]
  })
  const references = await findStorageReferences(objects.map(({ key }) => key))

  return {
    bucket,
    nextCursor: result.NextContinuationToken,
    files: objects.map((object) => ({
      ...object,
      url: storageFileUrl(object.key),
      reference: references.get(object.key),
      recent: isRecentAppUpload(object.key, object.lastModified),
    })),
  }
}

export function headStorageFile(key: string) {
  return s3.send(new HeadObjectCommand({ Bucket: getS3Bucket(), Key: key }))
}

export function downloadStorageFile(key: string, signal: AbortSignal) {
  return s3.send(new GetObjectCommand({ Bucket: getS3Bucket(), Key: key }), { abortSignal: signal })
}
