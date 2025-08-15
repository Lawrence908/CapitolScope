import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    watch: {
      usePolling: true
    }
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'chart.js',
      'react-chartjs-2',
      'axios',
      'date-fns'
    ],
    force: true
  },
  build: {
    target: 'esnext', // Modern target for better performance
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn']
      }
    },
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true
    },
    rollupOptions: {
      external: [],
      output: {
        manualChunks: (id) => {
          // Core React libraries
          if (id.includes('react') || id.includes('react-dom')) {
            return 'react-vendor';
          }
          
          // Routing
          if (id.includes('react-router-dom')) {
            return 'router';
          }
          
          // Charts (heavy library)
          if (id.includes('chart.js') || id.includes('react-chartjs-2')) {
            return 'charts';
          }
          
          // Utilities
          if (id.includes('axios') || id.includes('date-fns')) {
            return 'utils';
          }
          
          // UI components (Heroicons)
          if (id.includes('@heroicons/react')) {
            return 'icons';
          }
          
          // Large components
          if (id.includes('Analytics.tsx')) {
            return 'analytics';
          }
          if (id.includes('TradeBrowser.tsx')) {
            return 'trade-browser';
          }
          if (id.includes('MembersBrowser.tsx')) {
            return 'members-browser';
          }
          if (id.includes('ProfileSettings.tsx')) {
            return 'profile-settings';
          }
          
          // Default vendor chunk for other node_modules
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
        // Optimize chunk naming for better caching
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop() : 'chunk';
          return `js/[name]-[hash].js`;
        },
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name;
          if (!name) return 'assets/[name]-[hash].[ext]';
          
          const info = name.split('.');
          const ext = info[info.length - 1];
          if (/\.(css)$/.test(name)) {
            return `css/[name]-[hash].${ext}`;
          }
          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(name)) {
            return `images/[name]-[hash].${ext}`;
          }
          return `assets/[name]-[hash].${ext}`;
        }
      }
    },
    // Enable chunk size warnings
    chunkSizeWarningLimit: 1000
  },
  resolve: {
    alias: {
      'react': 'react',
      'react-dom': 'react-dom'
    }
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production')
  },
  // CSS optimization - simplified without autoprefixer
  css: {
    devSourcemap: false
  }
})
