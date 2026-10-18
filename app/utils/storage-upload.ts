/**
 * app/utils/storage-upload.ts
 *
 * spec #17 / #19 / #20 — upload helper.
 *
 *   - filename: `feed/{postId}/{uuid}.webp`
 *   - upsert: false (never overwrite)
 *   - returns the storage path (NOT the public URL — use getStorageImageUrl)
 */

import { useSupabaseAdmin } from '~/composables/useSupabaseTyped'

export interface UploadResult {
  path: string
  publicUrl: string
  size: number
  mimeType: string
}

function uuid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  // Fallback (should not hit in modern browsers)
  return Array.from({ length: 32 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('')
}

function getExt(mime: string): string {
  if (mime === 'image/webp') return 'webp'
  if (mime === 'image/png') return 'png'
  if (mime === 'image/jpeg') return 'jpg'
  if (mime === 'image/jpg') return 'jpg'
  return 'bin'
}

/**
 * Upload a single image (already optimized) to `feed/{postId}/{uuid}.{ext}`.
 */
export async function uploadPostImage(
  postId: string,
  blob: Blob,
  mimeType: string
): Promise<UploadResult> {
  const sb = await useSupabaseAdmin()
  if (!sb) throw new Error('Supabase admin client not available')

  const ext = getExt(mimeType)
  const fileName = `${uuid()}.${ext}`
  const path = `feed/${postId}/${fileName}`

  const { error } = await sb.storage
    .from('kkinit-images')
    .upload(path, blob, {
      cacheControl: '3600',
      upsert: false,
      contentType: mimeType
    })

  if (error) throw error

  const { data } = sb.storage.from('kkinit-images').getPublicUrl(path)

  return {
    path,
    publicUrl: data.publicUrl,
    size: blob.size,
    mimeType
  }
}

/**
 * Delete one or more storage paths. Idempotent (404 → no throw).
 */
export async function deleteStoragePaths(paths: string[]): Promise<void> {
  if (paths.length === 0) return
  const sb = await useSupabaseAdmin()
  if (!sb) return

  const { error } = await sb.storage
    .from('kkinit-images')
    .remove(paths)
  if (error && import.meta.dev) {
    console.warn('[deleteStoragePaths]', error.message)
  }
}
