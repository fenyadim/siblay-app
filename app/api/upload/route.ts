import { type NextRequest, NextResponse } from "next/server"
import { nanoid } from "nanoid"

import { validateAttachment } from "@/lib/attachments"
import { auth } from "@/lib/auth"
import { generateBlurDataURL } from "@/lib/blur"
import { createRateLimiter, getClientId } from "@/lib/rate-limit"
import { getS3Url, uploadS3Object } from "@/lib/s3"

const uploadLimiter = createRateLimiter({
  limit: 20,
  windowMs: 60 * 60 * 1000,
  name: "upload",
})

export async function POST(req: NextRequest) {
  const rateLimit = uploadLimiter(getClientId(req.headers))
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Слишком много запросов. Попробуйте позже." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfter) } },
    )
  }

  try {
    const session = await auth.api.getSession({ headers: req.headers })
    if (!session || session.user.email !== process.env.ADMIN_EMAIL) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("file")
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Файл не передан" }, { status: 400 })
    }

    const type = validateAttachment(file.name, file.size, "image")
    if ("error" in type) {
      return NextResponse.json({ error: type.error }, { status: 400 })
    }

    const key = `portfolio/${nanoid()}/${Date.now()}.${type.extension}`
    const body = Buffer.from(await file.arrayBuffer())
    const [, blurDataURL] = await Promise.all([
      uploadS3Object(key, body, type.contentType),
      generateBlurDataURL(body),
    ])

    return NextResponse.json({ fileUrl: getS3Url(key), key, blurDataURL })
  } catch (err) {
    console.error("[upload]", err)
    return NextResponse.json({ error: "Ошибка загрузки файла" }, { status: 500 })
  }
}
