// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@vite-pwa/nuxt'],

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
    },
  },
})
