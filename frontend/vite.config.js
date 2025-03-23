import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',   // Needed for tunneling (Cloudflare, localhost.run, etc.)
    port: 5173,        // Use whatever port you're exposing
    strictPort: true,  // Avoid Vite switching ports
    cors: true         // Enable CORS for external access
  }
})
