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
      background_color: '#FAFAFA',
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
