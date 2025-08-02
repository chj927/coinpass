import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    loadEnv(mode, '.', '');
    const isDev = mode === 'development';
    
    return {
      // API keys removed from client-side for security
      define: {
        // Only define non-sensitive constants here
        'process.env.NODE_ENV': JSON.stringify(mode),
        __DEV__: isDev
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      server: {
        port: 3000,
        open: true,
        cors: true,
        hmr: {
          overlay: true
        }
      },
      preview: {
        host: true,
        port: 8080,
        strictPort: true,
        allowedHosts: [
          'coinpass.onrender.com',
          'coinpass.kr',
          'www.coinpass.kr',
        ],
      },
      build: {
        target: 'es2020',
        minify: 'esbuild',
        sourcemap: !isDev,
        rollupOptions: {
          input: {
            main: path.resolve(__dirname, 'index.html'),
            admin: path.resolve(__dirname, 'admin.html'),
            exchange: path.resolve(__dirname, 'exchange.html'),
            compare: path.resolve(__dirname, 'compare.html'),
          },
          output: {
            manualChunks: {
              // 보안 관련 모듈 분리
              'security': ['./security-utils.ts'],
              // 데이터베이스 관련 모듈 분리
              'database': ['./supabaseClient.ts', '@supabase/supabase-js'],
              // 유틸리티 모듈 분리
              'utils': ['./error-handler.ts', './performance-monitor.ts', './types.ts']
            },
            chunkFileNames: 'assets/[name]-[hash].js',
            entryFileNames: 'assets/[name]-[hash].js',
            assetFileNames: 'assets/[name]-[hash].[ext]'
          }
        },
        // esbuild minification options
        ...(isDev ? {} : {
          drop: ['console', 'debugger'],
          pure: ['console.log', 'console.debug']
        }),
        chunkSizeWarningLimit: 1000,
        assetsInlineLimit: 4096
      },
      optimizeDeps: {
        include: ['@supabase/supabase-js']
      },
      css: {
        devSourcemap: isDev,
        preprocessorOptions: {
          // CSS 최적화 옵션 추가 가능
        }
      },
      // CSP 헤더 추가 (보안 강화)
      plugins: [
        {
          name: 'add-security-headers',
          configureServer(server) {
            server.middlewares.use((_req, res, next) => {
              res.setHeader('X-Content-Type-Options', 'nosniff');
              res.setHeader('X-Frame-Options', 'DENY');
              res.setHeader('X-XSS-Protection', '1; mode=block');
              res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
              next();
            });
          }
        }
      ]
    };
});