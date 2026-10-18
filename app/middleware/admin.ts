/**
 * app/middleware/admin.ts
 *
 *  spec #7 — gate /admin/** with Supabase Auth + admin_users.
 *
 *  - If Supabase env not set → redirect to /admin/login with notice.
 *  - If no session → redirect to /admin/login.
 *  - If session but not in admin_users → redirect to /admin/login.
 *  - Otherwise allow.
 *
 *  Dev bypass: when running in dev mode AND no real session exists
 *  (e.g. service_role / dashboard bootstrap not yet done), the middleware
 *  allows the request and `useSupabaseAdmin` mocks itself as a synthetic
 *  admin user. This is gated by:
 *    1) `import.meta.dev` (Nuxt dev server only), and
 *    2) `NUXT_DEV_ADMIN_BYPASS` env flag explicitly set to "1" or "true".
 *  Production builds always require a real session.
 */
import {
  isCurrentUserAdmin,
  useSupabaseAdmin,
  useSupabaseAuth
} from '~/composables/useSupabaseTyped'

const DEV_BYPASS_KEYS = ['NUXT_DEV_ADMIN_BYPASS', 'NUXT_PUBLIC_DEV_ADMIN_BYPASS']

function isDevBypassEnabled(): boolean {
  if (!import.meta.dev) return false
  for (const key of DEV_BYPASS_KEYS) {
    const v = process.env[key]
    if (v && /^(1|true|yes)$/i.test(v)) return true
  }
  return false
}

export default defineNuxtRouteMiddleware(async (to) => {
  if (!to.path.startsWith('/admin')) return

  // /admin/login itself is the public auth gate
  if (to.path === '/admin/login') return

  // Dev bypass — lets you see the admin UI without manually creating an
  // auth user. Gated by import.meta.dev + explicit env flag.
  if (isDevBypassEnabled()) return

  /*
   * Session / admin check 는 auth client (anon) 로.
   * service-role client 는 세션이 없어서 여기 쓸 수 없음.
   */
  const auth = await useSupabaseAuth()
  const admin = await useSupabaseAdmin()
  if (!auth || !admin) {
    return navigateTo({
      path: '/admin/login',
      query: { reason: 'no-env' }
    })
  }

  const { data } = await auth.auth.getSession()
  if (!data.session) {
    return navigateTo({
      path: '/admin/login',
      query: { reason: 'no-session' }
    })
  }

  const isAdmin = await isCurrentUserAdmin()
  if (!isAdmin) {
    return navigateTo({
      path: '/admin/login',
      query: { reason: 'not-admin' }
    })
  }
})
