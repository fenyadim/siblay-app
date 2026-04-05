import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

// Beget S3: https://s3.{region}.storage.beget.cloud
const ENDPOINT = `https://s3.${process.env.AWS_REGION ?? "ru1"}.storage.beget.cloud`

export const s3 = new S3Client({
  region: process.env.AWS_REGION ?? "ru1",
  endpoint: ENDPOINT,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
  },
  forcePathStyle: true, // required for non-AWS S3
})

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
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
    }),
  )
}

// Public URL format for Beget (path-style, matches forcePathStyle: true)
// https://s3.{region}.storage.beget.cloud/{bucket}/{key}
export function getS3Url(key: string) {
  const bucket = process.env.AWS_S3_BUCKET
  const region = process.env.AWS_REGION ?? "ru1"
  return `https://s3.${region}.storage.beget.cloud/${bucket}/${key}`
}
