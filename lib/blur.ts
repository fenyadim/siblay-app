import sharp from 'sharp'

/**
 * Generate a tiny base64 data URL suitable for next/image `blurDataURL`.
 *
 * 12×12 px JPEG quality 50 → ~250-400 bytes encoded — small enough to ship
 * inline in HTML/JSON without bloating payloads, large enough to read as a
 * believable preview after CSS blur.
 *
 * Image-only: caller should pre-check that the source is JPEG/PNG/WEBP/HEIC
 * (sharp also handles those). 3D-model files must not reach this.
 */
export async function generateBlurDataURL(buffer: Buffer): Promise<string | null> {
  try {
    const resized = await sharp(buffer)
      .resize(12, 12, { fit: 'inside' })
      .jpeg({ quality: 50 })
      .toBuffer()
    return `data:image/jpeg;base64,${resized.toString('base64')}`
  } catch {
    // A malformed file shouldn't break the upload — caller falls back to no
    // placeholder.
    return null
  }
}
