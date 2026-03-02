// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  nitro: {
    routeRules: {
      '/api/**': {
        proxy: 'http://localhost:3000/api/**',
        cache: false
      }
    },
    prerender: {
      crawlLinks: false
    }
  },
  ssr: true
})
