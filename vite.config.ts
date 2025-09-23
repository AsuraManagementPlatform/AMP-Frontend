import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import svgr from 'vite-plugin-svgr'

export default defineConfig({
  plugins: [
      react(),
      svgr({
          svgrOptions: {
              exportType: 'default',
          },
      }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    hmr: {
      overlay: false,
    },
    host: 'localhost',
    port: 5173,
    strictPort: true, 
  },
  preview: {
    port: 4173,
    strictPort: true,
  },
})
