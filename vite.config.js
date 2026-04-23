import { defineConfig, loadEnv } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import path from 'node:path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { createExchangeRateDevMiddleware } from './server/exchangeRateProxy.js'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    envPrefix: ['PUBLIC_'],
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'exchange-rate-dev-proxy',
        configureServer(server) {
          server.middlewares.use(
            '/api/exchange-rate',
            createExchangeRateDevMiddleware(env),
          )
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(fileURLToPath(new URL('.', import.meta.url)), './src'),
      },
    },
  }
})
