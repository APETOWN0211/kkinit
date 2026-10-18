/**
 * app/composables/useSupabase.ts
 *
 * Spec #5 / #26 — Supabase client lazy init.
 *
 *  - anon key + URL 이 .env 에 있으면 client 를 만든다.
 *  - 둘 중 하나라도 비어있으면 null 반환 → 컴포넌트는 mock 데이터로 동작.
 *  - service_role key 는 이 파일이 절대 import 하지 않는다.
 *  - client 는 singleton 으로 module level 에 cache 된다.
 *
 * spec #26 (안전 규칙) — 현재 credentials 가 없으므로 이 client 는 호출되지 않고,
 * `getStorageImageUrl` 만 동작한다. credentials 가 채워지면 그대로 활성화.
 *
 * 의존성: `npm i @supabase/supabase-js` (아직 미설치라면 install 후 사용).
 *        type import 는 dynamic import 와 함께 lazy 처리해서
 *        미설치 환경에서도 import error 가 나지 않도록 한다.
 */

let _client: unknown = null
let _attempted = false

export async function useSupabase(): Promise<unknown | null> {
  if (_attempted) return _client
  _attempted = true

  const cfg = useRuntimeConfig()
  const url = cfg.public.supabaseUrl
  const key = cfg.public.supabaseAnonKey

  if (!url || !key) {
    // credentials 미설정. spec #26 — fail-soft.
    if (import.meta.dev) {
      console.info(
        '[useSupabase] NUXT_PUBLIC_SUPABASE_URL / ANON_KEY not set. ' +
        'Falling back to mock data + local placeholder images.'
      )
    }
    return null
  }

  try {
    const mod = await import('@supabase/supabase-js')
    const createClient = (mod as any).createClient
    if (typeof createClient !== 'function') throw new Error('createClient missing')
    _client = createClient(url, key, {
      auth: { persistSession: true, autoRefreshToken: true }
    })
    return _client
  } catch (e) {
    if (import.meta.dev) {
      console.warn(
        '[useSupabase] @supabase/supabase-js not installed or failed. ' +
        'Run `npm i @supabase/supabase-js` if you need real Supabase client. ' +
        'Falling back to mock.',
        e
      )
    }
    return null
  }
}
