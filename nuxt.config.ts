export default defineNuxtConfig({
  devtools: {
    enabled: true,
    vscode: {},
    timeline: {
      enabled: true
    }
  },

  // SSR 비활성화 - Phaser는 Canvas 기반이므로 CSR 필수
  ssr: false,

  // TypeScript 설정
  typescript: {
    strict: true
  },

  // Vite 설정
  vite: {
    optimizeDeps: {
      include: ['phaser']
    },
    server: {
      hmr: {
        protocol: 'ws',
        host: 'localhost',
        port: 3000,
        clientPort: 3000
      }
    }
  },

  // 앱 설정
  app: {
    head: {
      title: 'Survivor Games Platform',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1.0, user-scalable=no' }
      ]
    }
  },

  compatibilityDate: '2026-01-15'
})
