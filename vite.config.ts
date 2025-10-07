import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    target: 'es2015',
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          mui: ['@mui/material', '@mui/icons-material'],
          router: ['react-router-dom'],
          query: ['@tanstack/react-query'],
        },
      },
    },
  },
  server: {
    port: 3000,
    open: true,
    // Uncomment the following lines to enable HTTPS in development
    // https: true,
    proxy: {
      '/api': {
        target: 'https://k2.52j.me',
        changeOrigin: true,
        secure: true,
        ws: true,
        rewrite: (path) => path, // Keep the /api prefix
        headers: {
          'Origin': 'https://k2.52j.me',
          'Referer': 'https://k2.52j.me'
        },
        configure: (proxy, _options) => {
          proxy.on('error', (err, req, _res) => {
            console.error('❌ Proxy Error:', err.message);
            console.error('Request URL:', req.url);
            console.error('Error details:', {
              code: (err as any).code,
              errno: (err as any).errno,
              syscall: (err as any).syscall,
              hostname: (err as any).hostname
            });
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            // Add additional headers to help with CORS
            proxyReq.setHeader('Origin', 'https://k2.52j.me');
            proxyReq.setHeader('Referer', 'https://k2.52j.me');

            console.log('🚀 Proxying Request:', {
              method: req.method,
              originalUrl: req.url,
              targetUrl: `https://k2.52j.me${req.url}`,
              headers: {
                'X-Access-Key': proxyReq.getHeader('X-Access-Key') ? '***' : 'missing',
                'Content-Type': proxyReq.getHeader('Content-Type'),
                'Origin': proxyReq.getHeader('Origin'),
                'Referer': proxyReq.getHeader('Referer')
              }
            });
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('📥 Proxy Response:', {
              status: proxyRes.statusCode,
              statusText: proxyRes.statusMessage,
              url: req.url,
              headers: {
                'content-type': proxyRes.headers['content-type'],
                'access-control-allow-origin': proxyRes.headers['access-control-allow-origin'],
                'access-control-allow-methods': proxyRes.headers['access-control-allow-methods'],
                'access-control-allow-headers': proxyRes.headers['access-control-allow-headers']
              }
            });
          });
        },
      },
    },
  },
  preview: {
    port: 3000,
  },
})
