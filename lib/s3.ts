import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

const ENDPOINT = "https://s3.twcstorage.ru"

export const s3 = new S3Client({
  region: process.env.AWS_REGION ?? "ru-1",
  endpoint: ENDPOINT,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
  },
  forcePathStyle: true,
})

export function getS3Bucket() {
  const bucket = process.env.AWS_S3_BUCKET
  if (!bucket) throw new Error('S3 bucket is not configured')
  return bucket
}

export async function uploadS3Object(key: string, body: Uint8Array, contentType: string) {
  await s3.send(
    new PutObjectCommand({
      Bucket: getS3Bucket(),
      Key: key,
      Body: body,
      ContentType: contentType,
      ContentLength: body.byteLength,
      ACL: 'public-read',
    }),
  )
}

export async function getPresignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn = 300,
) {
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
    ContentType: contentType,
  })
  return getSignedUrl(s3, command, { expiresIn })
}

export async function deleteS3Object(key: string) {
  await s3.send(
    new DeleteObjectCommand({
      Bucket: getS3Bucket(),
      Key: key,
    }),
  )
}

export async function deleteS3Objects(keys: string[]) {
  const results = await Promise.allSettled(keys.map(deleteS3Object))
  const failures = results.flatMap((result, index) =>
    result.status === 'rejected' ? [new Error(keys[index], { cause: result.reason })] : [],
  )
  if (failures.length) throw new AggregateError(failures, 'S3 deletion failed')
}

export function getS3Url(key: string) {
  return `${ENDPOINT}/${process.env.AWS_S3_BUCKET}/${key}`
}

export function s3KeyFromUrl(fileUrl: string): string | null {
  if (!process.env.AWS_S3_BUCKET) return null

  const prefix = getS3Url("")
  if (!fileUrl.startsWith(prefix)) return null

  return fileUrl.slice(prefix.length) || null
}

export async function deleteSubmissionAttachments(files: { fileUrl: string }[]) {
  const keys = files
    .map(({ fileUrl }) => s3KeyFromUrl(fileUrl))
    .filter((key): key is string => key !== null && key.startsWith('orders/'))
  await deleteS3Objects([...new Set(keys)]).catch((error) => {
    console.error('[submissions] Could not delete S3 attachments', error)
    throw new Error('Не удалось удалить файлы. Повторите попытку.')
  })
}
