import { NextRequest, NextResponse } from "next/server"
import { s3, getS3Url } from "@/lib/s3"
import { PutObjectCommand } from "@aws-sdk/client-s3"
import { nanoid } from "nanoid"
import { auth } from "@/lib/auth"
import { generateBlurDataURL } from "@/lib/blur"
import { createRateLimiter, getClientId } from "@/lib/rate-limit"

const uploadLimiter = createRateLimiter({
  limit: 20,
  windowMs: 60 * 60 * 1000,
  name: "upload",
})

// ── Allowed types ─────────────────────────────────────────────────────────────
// Server-side mapping: extension → Content-Type. Client-supplied MIME is ignored
// so an attacker can't upload e.g. SVG-as-PNG and get it served as image/svg+xml.
const EXTENSION_CONTENT_TYPE: Record<string, string> = {
  stl: "application/sla",
  obj: "model/obj",
  "3mf": "model/3mf",
  step: "model/step",
  stp: "model/step",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  heic: "image/heic",
}

const IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "heic"])

function getExtension(fileName: string): string {
  return fileName.split(".").pop()?.toLowerCase() ?? ""
}

function getServerContentType(ext: string): string | null {
  return EXTENSION_CONTENT_TYPE[ext] ?? null
}

// ── Max sizes ─────────────────────────────────────────────────────────────────
const MAX_IMAGE_SIZE = 20 * 1024 * 1024  // 20 MB
const MAX_MODEL_SIZE = 100 * 1024 * 1024 // 100 MB

export async function POST(req: NextRequest) {
  const rateLimit = uploadLimiter(getClientId(req.headers))

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Слишком много запросов. Попробуйте позже." },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfter) },
      },
    )
  }

  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null
    const folder = formData.get("folder") === "portfolio" ? "portfolio" : "orders"

    if (folder === "portfolio") {
      const session = await auth.api.getSession({ headers: req.headers })
      if (!session || session.user.email !== process.env.ADMIN_EMAIL) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
    }

    if (!file) {
      return NextResponse.json({ error: "Файл не передан" }, { status: 400 })
    }

    if (file.size <= 0) {
      return NextResponse.json({ error: "Файл пустой" }, { status: 400 })
    }

    if (file.name.length > 255) {
      return NextResponse.json({ error: "Слишком длинное имя файла" }, { status: 400 })
    }

    const ext = getExtension(file.name)
    const serverContentType = getServerContentType(ext)
    if (!serverContentType) {
      return NextResponse.json(
        { error: "Недопустимый тип файла. Разрешены: STL, OBJ, 3MF, STEP, JPG, PNG, WEBP, HEIC" },
        { status: 400 },
      )
    }

    const isImage = IMAGE_EXTENSIONS.has(ext)
    const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_MODEL_SIZE
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `Файл слишком большой. Максимум ${isImage ? "20" : "100"} МБ` },
        { status: 400 },
      )
    }

    if (folder === "portfolio" && !isImage) {
      return NextResponse.json(
        { error: "В портфолио можно загружать только изображения" },
        { status: 400 },
      )
    }

    if (!process.env.AWS_S3_BUCKET) {
      return NextResponse.json({ error: "S3 bucket is not configured" }, { status: 500 })
    }

    const key = `${folder}/${nanoid()}/${Date.now()}.${ext}`
    const body = Buffer.from(await file.arrayBuffer())

    // Generate blur placeholder for portfolio images in parallel with the
    // S3 upload — the blur is independent of the upload result.
    const [, blurDataURL] = await Promise.all([
      s3.send(
        new PutObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET,
          Key: key,
          Body: body,
          ContentType: serverContentType,
          ContentLength: file.size,
          ACL: "public-read",
        }),
      ),
      folder === "portfolio" && isImage ? generateBlurDataURL(body) : Promise.resolve(null),
    ])

    const fileUrl = getS3Url(key)
    return NextResponse.json({ fileUrl, key, blurDataURL })
  } catch (err) {
    console.error("[upload]", err)
    return NextResponse.json({ error: "Ошибка загрузки файла" }, { status: 500 })
  }
}
