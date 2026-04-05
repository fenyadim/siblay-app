import { NextRequest, NextResponse } from "next/server"
import { s3, getS3Url } from "@/lib/s3"
import { PutObjectCommand } from "@aws-sdk/client-s3"
import { nanoid } from "nanoid"

// ── Rate limiting (in-memory, per IP) ────────────────────────────────────────
const RATE_LIMIT = 20
const WINDOW_MS = 60 * 60 * 1000

const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return true
  }
  if (entry.count >= RATE_LIMIT) return false
  entry.count++
  return true
}

// ── Allowed types ─────────────────────────────────────────────────────────────
const ALLOWED_EXTENSIONS = new Set([
  "stl", "obj", "3mf", "step", "stp",
  "jpg", "jpeg", "png", "webp", "heic",
])

const ALLOWED_MIME_PREFIXES = [
  "image/",
  "model/",
  "application/octet-stream",
  "application/x-octet-stream",
  "application/sla",
  "application/vnd.ms-pki.stl",
  "application/3mf",
]

function isAllowedFile(fileName: string, contentType: string): boolean {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? ""
  if (!ALLOWED_EXTENSIONS.has(ext)) return false
  const normalizedType = contentType.toLowerCase().split(";")[0].trim()
  return ALLOWED_MIME_PREFIXES.some((prefix) => normalizedType.startsWith(prefix))
}

// ── Max sizes ─────────────────────────────────────────────────────────────────
const MAX_IMAGE_SIZE = 20 * 1024 * 1024  // 20 MB
const MAX_MODEL_SIZE = 100 * 1024 * 1024 // 100 MB

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Слишком много запросов. Попробуйте позже." },
      { status: 429 },
    )
  }

  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null
    const folder = formData.get("folder") === "portfolio" ? "portfolio" : "orders"

    if (!file) {
      return NextResponse.json({ error: "Файл не передан" }, { status: 400 })
    }

    if (file.name.length > 255) {
      return NextResponse.json({ error: "Слишком длинное имя файла" }, { status: 400 })
    }

    if (!isAllowedFile(file.name, file.type)) {
      return NextResponse.json(
        { error: "Недопустимый тип файла. Разрешены: STL, OBJ, 3MF, STEP, JPG, PNG, WEBP, HEIC" },
        { status: 400 },
      )
    }

    const isImage = file.type.startsWith("image/")
    const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_MODEL_SIZE
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `Файл слишком большой. Максимум ${isImage ? "20" : "100"} МБ` },
        { status: 400 },
      )
    }

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin"
    const key = `${folder}/${nanoid()}/${Date.now()}.${ext}`

    const buffer = Buffer.from(await file.arrayBuffer())

    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: file.type,
        ContentLength: buffer.length,
        ACL: "public-read",
      }),
    )

    const fileUrl = getS3Url(key)
    return NextResponse.json({ fileUrl, key })
  } catch (err) {
    console.error("[upload]", err)
    return NextResponse.json({ error: "Ошибка загрузки файла" }, { status: 500 })
  }
}
