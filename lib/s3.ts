import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { PutObjectCommand } from "@aws-sdk/client-s3"

export const s3 = new S3Client({
  region: process.env.AWS_REGION ?? "eu-central-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
  },
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

export function getS3Url(key: string) {
  return `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION ?? "eu-central-1"}.amazonaws.com/${key}`
}
