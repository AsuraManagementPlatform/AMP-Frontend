import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    hmr: {
      overlay: false, // Disable error overlay if needed
    },
    host: 'localhost',
    port: 5173,
    strictPort: true, // Fail if port is occupied
  },
  preview: {
    port: 4173,
    strictPort: true,
  },
})
