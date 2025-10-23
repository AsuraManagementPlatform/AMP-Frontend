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
    host: true, // Listen on all IPv4 interfaces
    port: parseInt(process.env.PORT || '5173'),
    strictPort: false, // Allow fallback if port is in use
  },
  preview: {
    host: true, // Listen on all interfaces
    port: parseInt(process.env.PORT || '4173'),
    strictPort: false,
  },
  // Ensure environment variables are handled properly
  define: {
    'process.env.VITE_KEYCLOAK_URL': JSON.stringify(process.env.VITE_KEYCLOAK_URL),
    'process.env.VITE_KEYCLOAK_REALM': JSON.stringify(process.env.VITE_KEYCLOAK_REALM),
    'process.env.VITE_KEYCLOAK_CLIENT_ID': JSON.stringify(process.env.VITE_KEYCLOAK_CLIENT_ID),
    'process.env.VITE_API_BASE_URL': JSON.stringify(process.env.VITE_API_BASE_URL),
  },
  build: {
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'query-vendor': ['@tanstack/react-query'],
          'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
          'ui-vendor': ['react-hot-toast'],
        }
      }
    }
  }
})
