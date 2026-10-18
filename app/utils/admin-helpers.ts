/**
 * app/utils/admin-helpers.ts
 *
 * Admin-page URL helpers.
 *
 *  - publicUrl(path) → Supabase Storage public URL
 *  - getStorageBucket() → bucket name from runtimeConfig
 */
import { useRuntimeConfig } from '#imports'

export function getStorageBucket(): string {
  const cfg = useRuntimeConfig()
  return cfg.public.supabaseStorageBucket || 'kkinit-images'
}

export function publicUrl(path: string): string {
  if (!path) return ''
  if (/^https?:\/\//i.test(path)) return path
  const cfg = useRuntimeConfig()
  const base = (cfg.public.supabaseUrl || '').replace(/\/+$/, '')
  if (!base) return ''
  const cleanPath = path.replace(/^\/+/, '')
  return `${base}/storage/v1/object/public/${getStorageBucket()}/${cleanPath}`
}
