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
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor';
            }
            if (id.includes('@tanstack/react-query')) {
              return 'query-vendor';
            }
            if (id.includes('react-hook-form') || id.includes('zod') || id.includes('@hookform')) {
              return 'form-vendor';
            }
            if (id.includes('keycloak-js')) {
              return 'keycloak-vendor';
            }
            if (id.includes('i18next') || id.includes('react-i18next')) {
              return 'i18n-vendor';
            }
            if (id.includes('date-fns')) {
              return 'date-vendor';
            }
            if (id.includes('recharts') || id.includes('d3-')) {
              return 'chart-vendor';
            }
            if (id.includes('react-hot-toast')) {
              return 'ui-vendor';
            }
            return 'vendor';
          }
          if (id.includes('/src/services/')) {
            return 'services';
          }
          if (id.includes('/src/components/ui/')) {
            return 'ui-components';
          }
          if (id.includes('/src/components/modals/')) {
            return 'modals';
          }
        }
      }
    }
  }
})
