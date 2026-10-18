/**
 * app/utils/profile-avatar.ts
 *
 * spec #5 (admin profiles page) — upload a profile avatar.
 *
 *   - filename: `chat/{username}.webp`
 *   - upsert: true (admin can re-upload to update an existing avatar)
 */

import { useSupabaseAdmin } from '~/composables/useSupabaseTyped'
import { optimizeImage } from '~/utils/image-optimizer'

const AVATAR_MAX_WIDTH = 512
const AVATAR_QUALITY = 0.85

export interface AvatarUploadResult {
  path: string
  publicUrl: string
  width: number
  height: number
}

export async function uploadProfileAvatar(
  username: string,
  file: File
): Promise<AvatarUploadResult> {
  const sb = await useSupabaseAdmin()
  if (!sb) throw new Error('Supabase admin client not available')

  const optimized = await optimizeImage(file, {
    maxWidth: AVATAR_MAX_WIDTH,
    quality: AVATAR_QUALITY
  })

  // Sanitize username to a filename-safe token
  const safeUser = username.replace(/[^a-z0-9_]/gi, '').toLowerCase() || 'user'
  const path = `chat/${safeUser}.webp`

  const { error } = await sb.storage
    .from('kkinit-images')
    .upload(path, optimized.blob, {
      cacheControl: '3600',
      upsert: true,
      contentType: optimized.mimeType
    })
  if (error) throw error

  const { data } = sb.storage.from('kkinit-images').getPublicUrl(path)

  return {
    path,
    publicUrl: data.publicUrl,
    width: optimized.width,
    height: optimized.height
  }
}
