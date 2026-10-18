// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: process.env.NODE_ENV === 'production' ? ['@vite-pwa/nuxt'] : [],

  /*
   * Supabase runtime config (spec #6).
   *  - public.* 은 클라이언트 번들에 포함된다 → anon key 만 노출.
   *  - service_role key 는 절대 여기에 두지 않는다 (spec #5 / #26).
   *  - 값이 비어 있으면 `getStorageImageUrl()` 이
   *    `null` 을 돌려주고, 컴포넌트는 placeholder 로 fallback 한다.
   *  - 실제 값은 .env (NUXT_PUBLIC_SUPABASE_URL, NUXT_PUBLIC_SUPABASE_ANON_KEY) 으로 주입.
   */
  runtimeConfig: {
    /*
     * SERVER-ONLY: service-role key (NUXT_SUPABASE_SERVICE_ROLE_KEY).
     *  - 클라이언트 번들에 절대 노출 안 됨 (NUXT_PUBLIC_ prefix 없음)
     *  - useSupabaseAdmin() 가 INSERT/UPDATE/DELETE RLS 우회용으로 사용
     *  - 값이 비어 있으면 anon-key client 로 fallback
     */
    supabaseServiceRoleKey: '',
    public: {
      supabaseUrl: '',
      supabaseAnonKey: '',
      supabaseStorageBucket: 'kkinit-images'
    }
  },

  // Global CSS
  css: ['~/assets/css/main.css'],

  // App Head Configuration
  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover',
      title: '끼닛',
      meta: [
        { name: 'description', content: '끼닛 - 맛집 SNS' },
        // iOS PWA
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'apple-mobile-web-app-title', content: '끼닛' },
      ],
      link: [
        { rel: 'manifest', href: '/manifest.webmanifest' },
      ],
    },
  },

  // PWA Configuration
  // - production 빌드에서만 활성화.
  // - dev 에서 PWA 모듈을 비활성화했지만 nuxt config 가 dev 에도 pwa 옵션을
  //   인식하면 internal worker create 가 호출되면서 h3 v2 strict 가 깨질 수 있다.
  //   따라서 dev 에서는 pwa 블록 자체를 생략.
  ...(process.env.NODE_ENV === 'production'
    ? {
        pwa: {
          registerType: 'autoUpdate',
          manifest: {
            name: '끼닛',
            short_name: '끼닛',
            description: '끼닛 - 맛집 SNS',
            display: 'standalone',
            orientation: 'portrait',
            start_url: '/',
            scope: '/',
            // PWA launch window 배경. 앱이 첫 프레임을 그리기 전에 보이는 색이라
            // Figma 1:178 splash orange(#FF6940) 로 맞춰 흰색 flash 를 없앤다.
            //
            // theme_color 는 여기서 바꾸지 않는다. manifest 의 theme_color 는 앱
            // 전역 기본값이라 orange 로 고정하면 route 별 theme-color 정책
            // (Home #FAFAFA / My #FF6940 / Notifications #F3F4F6) 과 충돌한다.
            // 실제 상태줄 색은 실행 중 <meta name="theme-color"> 가 route 별로 덮어쓴다.
            background_color: '#FF6940',
            theme_color: '#FAFAFA',
          },
          workbox: {
            // iOS PWA standalone 유지: navigation 시 SW가 모든 요청을 "/"로
            // fallback 하지 않도록 설정. 매 navigation 마다 SW가 개입하면
            // iOS WebKit이 standalone 컨텍스트를 재평가하며 URL 바가 노출됨.
            navigateFallback: null,
            navigateFallbackDenylist: [/^\/api\//, /^\/_nuxt\//, /^\/sw\.js$/],
          },
          devOptions: {
            enabled: false,
            type: 'module',
            suppressWarnings: true,
          },
        }
      }
    : {}),
})
