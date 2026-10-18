/**
 * app/composables/useSupabaseTyped.ts
 *
 * Typed Supabase clients.
 *
 *  - `useSupabaseAnon()`  — anon key client. SELECT only (public RLS).
 *  - `useSupabaseAdmin()` — auth-required client. INSERT/UPDATE/DELETE
 *                           gated by RLS `is_admin(auth.uid())`.
 *  - `useSupabaseClient()` — convenience = anon (default).
 *
 *  - service_role key is NEVER used here.
 *  - Clients are created lazily and cached per-process.
 *  - `getCurrentUserId()` returns the auth user's id, or null.
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '~/types/cms'

type AnyClient = SupabaseClient<Database, 'public', Database['public']>

let _anon: AnyClient | null = null
let _admin: AnyClient | null = null
let _anonAttempted = false
let _adminAttempted = false

async function loadCreateClient(): Promise<
  ((url: string, key: string, opts: Record<string, unknown>) => AnyClient) | null
> {
  try {
    const mod = (await import('@supabase/supabase-js')) as unknown as {
      createClient?: (
        url: string,
        key: string,
        opts: Record<string, unknown>
      ) => AnyClient
    }
    return typeof mod.createClient === 'function' ? mod.createClient : null
  } catch (e) {
    if (import.meta.dev) {
      console.warn('[useSupabase] @supabase/supabase-js not installed:', e)
    }
    return null
  }
}

/**
 * Anon client. Public SELECT access.
 * Returns `null` if env is missing or package not installed.
 */
export async function useSupabaseAnon(): Promise<AnyClient | null> {
  if (_anonAttempted) return _anon
  _anonAttempted = true

  const cfg = useRuntimeConfig()
  const url = cfg.public.supabaseUrl
  const key = cfg.public.supabaseAnonKey

  if (!url || !key) {
    if (import.meta.dev) {
      console.info(
        '[useSupabaseAnon] Supabase env not set. Mock data + local fallback.'
      )
    }
    return null
  }

  const create = await loadCreateClient()
  if (!create) return null

  _anon = create(url, key, {
    auth: { persistSession: false, autoRefreshToken: false }
  })
  return _anon
}

/**
 * Admin client. Persists session in localStorage so admin login survives reloads.
 *
 * - If `NUXT_SUPABASE_SERVICE_ROLE_KEY` is set, we use it (server-side only,
 *   bypasses RLS for INSERT/UPDATE/DELETE on posts/post_images/post_tags).
 *   This is the recommended path for /admin/** — the service-role key MUST
 *   stay server-side. See .env.example.
 * - Otherwise we fall back to anon-key + auth session (subject to RLS).
 *
 * Use this from /admin/** pages only (after admin login).
 *
 * NOTE: Because this client may be service-role (no session), you CANNOT
 *       use it to check the current user's identity. Use `useSupabaseAuth()`
 *       for that — it always returns an anon client with persistSession.
 */
export async function useSupabaseAdmin(): Promise<AnyClient | null> {
  if (_admin) return _admin
  if (_adminAttempted && !_admin) return null
  _adminAttempted = true

  const cfg = useRuntimeConfig()
  const url = cfg.public.supabaseUrl
  const anonKey = cfg.public.supabaseAnonKey
  const serviceKey = (cfg as unknown as { supabaseServiceRoleKey?: string })
    .supabaseServiceRoleKey

  if (!url || (!anonKey && !serviceKey)) {
    if (import.meta.dev) {
      console.info('[useSupabaseAdmin] Supabase env not set.')
    }
    return null
  }

  const create = await loadCreateClient()
  if (!create) return null

  /*
   * Prefer service-role when present.
   *  - service-role 는 NUXT_ prefix (private, server-side only)
   *  - anon 으로는 RLS 가 막혀서 admin 작업이 실패함
   *  - persistSession 끄기 (service-role 은 로그인 의미 없음)
   */
  if (serviceKey) {
    _admin = create(url, serviceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    })
  } else {
    _admin = create(url, anonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  }
  return _admin
}

/**
 * Auth-only anon client (always anon-key, persistSession on).
 * Use this for getSession / getUser / isCurrentUserAdmin — anywhere you
 * need to know WHO the current browser user is, not just have DB access.
 */
let _auth: AnyClient | null = null
let _authAttempted = false
export async function useSupabaseAuth(): Promise<AnyClient | null> {
  if (_auth) return _auth
  if (_authAttempted && !_auth) return null
  _authAttempted = true

  const cfg = useRuntimeConfig()
  const url = cfg.public.supabaseUrl
  const anonKey = cfg.public.supabaseAnonKey
  if (!url || !anonKey) return null

  const create = await loadCreateClient()
  if (!create) return null
  _auth = create(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  })
  return _auth
}

/**
 * Default convenience — anon.
 */
export async function useSupabaseClient(): Promise<AnyClient | null> {
  return useSupabaseAnon()
}

/**
 * Get the current auth user's id (admin client only).
 * Returns null if not signed in.
 */
export async function getCurrentUserId(): Promise<string | null> {
  const admin = await useSupabaseAdmin()
  if (!admin) return null
  const { data } = await admin.auth.getUser()
  return data.user?.id ?? null
}

/**
 * Check whether the current auth user is in admin_users.
 * Returns false on any error (including not signed in).
 */
export async function isCurrentUserAdmin(): Promise<boolean> {
  const auth = await useSupabaseAuth()
  if (!auth) return false
  const { data: session } = await auth.auth.getSession()
  const uid = session.session?.user.id
  if (!uid) return false

  const { data, error } = await auth
    .from('admin_users')
    .select('user_id')
    .eq('user_id', uid)
    .maybeSingle()

  if (error) {
    if (import.meta.dev) console.warn('[isCurrentUserAdmin]', error.message)
    return false
  }
  return !!data
}
