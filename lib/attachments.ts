const CONTENT_TYPES = {
  stl: 'application/sla',
  obj: 'model/obj',
  '3mf': 'model/3mf',
  step: 'model/step',
  stp: 'model/step',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  heic: 'image/heic',
} as const

export const MAX_IMAGE_SIZE = 20 * 1024 * 1024
export const MAX_MODEL_SIZE = 100 * 1024 * 1024
export const MAX_IMAGE_FILES = 10
export const MAX_MODEL_FILES = 3
export const MAX_QUOTE_FILES = 10

function attachmentType(name: string) {
  const extension = name.split('.').pop()?.toLowerCase() ?? ''
  if (!Object.hasOwn(CONTENT_TYPES, extension)) return null

  const contentType = CONTENT_TYPES[extension as keyof typeof CONTENT_TYPES]
  const isImage = contentType.startsWith('image/')
  return { extension, contentType, isImage, maxSize: isImage ? MAX_IMAGE_SIZE : MAX_MODEL_SIZE }
}

export function validateAttachment(
  name: string,
  size: number,
  kind?: 'image' | 'model',
): { extension: string; contentType: string } | { error: string } {
  if (size === 0) return { error: 'файл пустой' }
  if (name.length > 255) return { error: 'слишком длинное имя файла' }

  const type = attachmentType(name)
  if (!type || (kind && type.isImage !== (kind === 'image'))) {
    return { error: 'недопустимый тип файла' }
  }
  if (size > type.maxSize) {
    return { error: `файл слишком большой (до ${type.maxSize / 1024 / 1024} МБ)` }
  }

  return type
}

export function selectAttachments(
  current: File[],
  selected: FileList | File[],
  maxFiles: number,
  kind?: 'image' | 'model',
) {
  const files = [...current]
  const errors: string[] = []

  for (const file of Array.from(selected)) {
    if (files.length >= maxFiles) {
      errors.push(`Максимум ${maxFiles} файлов`)
      break
    }

    const result = validateAttachment(file.name, file.size, kind)
    if ('error' in result) errors.push(`${file.name}: ${result.error}`)
    else files.push(file)
  }

  return { files, errors }
}
