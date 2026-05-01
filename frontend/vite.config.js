import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/chat':        'http://localhost:8080',
      '/timeline':    'http://localhost:8080',
      '/eligibility': 'http://localhost:8080',
      '/quiz':        'http://localhost:8080',
      '/health':      'http://localhost:8080',
    },
  },
})
