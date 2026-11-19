import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ command, mode }) => {
  if (command === 'build' && process.env.VERCEL === '1') {
    const { VITE_BASE_URL } = loadEnv(mode, process.cwd(), 'VITE_')
    let apiUrl: URL
    try {
      apiUrl = new URL(VITE_BASE_URL)
    } catch {
      throw new Error('Configura VITE_BASE_URL en Vercel con la URL HTTPS de tu backend, incluyendo /api.')
    }
    if (apiUrl.protocol !== 'https:' || /^(localhost|127\..*|\[::1\])$/.test(apiUrl.hostname)
      || apiUrl.hostname.endsWith('.localhost') || apiUrl.hostname.endsWith('.example.com')) {
      throw new Error('VITE_BASE_URL debe apuntar a tu backend HTTPS real; no uses localhost ni el dominio de ejemplo.')
    }
  }

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  }
})
