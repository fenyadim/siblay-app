export const INQUIRY_FILE_ACCEPT = '.jpg,.jpeg,.png,.webp,.heic,.stp,.stl'
export const MAX_INQUIRY_FILES = 10

const PHOTO_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp', 'heic'])
const MODEL_EXTENSIONS = new Set(['stp', 'stl'])

export function inquiryFileError(file: { name: string; size: number }): string | null {
  const extension = file.name.split('.').pop()?.toLowerCase() ?? ''
  const isPhoto = PHOTO_EXTENSIONS.has(extension)
  if (!isPhoto && !MODEL_EXTENSIONS.has(extension)) {
    return 'Разрешены фото JPG, PNG, WEBP, HEIC и модели STP, STL'
  }
  if (file.name.length > 255) return 'Слишком длинное имя файла'
  if (file.size <= 0) return 'Файл пустой'
  const maxMB = isPhoto ? 20 : 100
  if (file.size > maxMB * 1024 * 1024) return `Максимальный размер — ${maxMB} МБ`
  return null
}
