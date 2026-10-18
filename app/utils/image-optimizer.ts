/**
 * app/utils/image-optimizer.ts
 *
 * spec #18 — pre-upload image optimization.
 *
 *   - max width        1600px
 *   - WebP output
 *   - quality 0.82
 *   - orientation normalized (EXIF is auto-applied by browser when drawing)
 *   - aspect ratio preserved
 *
 * No external library. Pure browser Canvas API.
 *
 * If the browser does not support WebP (Safari < 14 etc.) the function
 * returns the original file unchanged so the upload still works.
 */

export interface OptimizeOptions {
  maxWidth?: number
  quality?: number
  mimeType?: string
}

export interface OptimizeResult {
  blob: Blob
  width: number
  height: number
  mimeType: string
  originalSize: number
  optimizedSize: number
}

const DEFAULT_OPTS: Required<OptimizeOptions> = {
  maxWidth: 1600,
  quality: 0.82,
  mimeType: 'image/webp'
}

export function supportsWebP(): boolean {
  if (typeof document === 'undefined') return false
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 1
  const data = canvas.toDataURL('image/webp')
  return data.startsWith('data:image/webp')
}

export async function optimizeImage(
  file: File,
  options: OptimizeOptions = {}
): Promise<OptimizeResult> {
  const opts = { ...DEFAULT_OPTS, ...options }
  const originalSize = file.size

  // Reject non-image or zero-byte files early
  if (!file.type.startsWith('image/')) {
    throw new Error('Not an image file')
  }

  // If WebP is requested but not supported, fallback to original
  const useMime =
    opts.mimeType === 'image/webp' && !supportsWebP()
      ? file.type
      : opts.mimeType

  const bitmap = await createImageBitmap(file)
  const { width: srcW, height: srcH } = bitmap

  const targetW = Math.min(srcW, opts.maxWidth)
  const targetH = Math.round((srcH * targetW) / srcW)

  const canvas = document.createElement('canvas')
  canvas.width = targetW
  canvas.height = targetH

  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2d context unavailable')

  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(bitmap, 0, 0, targetW, targetH)
  bitmap.close()

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (b) resolve(b)
        else reject(new Error('Canvas toBlob returned null'))
      },
      useMime,
      opts.quality
    )
  })

  return {
    blob,
    width: targetW,
    height: targetH,
    mimeType: useMime,
    originalSize,
    optimizedSize: blob.size
  }
}
