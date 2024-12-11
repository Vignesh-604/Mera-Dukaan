import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Define the config with Vite's env loader
export default defineConfig(({ mode }) => {
  // Load environment variables based on the current mode (`development`, `production`, etc.)
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    server: {
      // proxy: {
      //   "/api": env.VITE_PROXY // Access env variable using `env` object
      // }
      proxy: {
        '/api': {
          target: env.BACKEND_URL || 'http://localhost:3000/api',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      }
    }
  }
})
