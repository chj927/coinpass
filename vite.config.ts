import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      // API keys removed from client-side for security
      define: {
        // Only define non-sensitive constants here
        'process.env.NODE_ENV': JSON.stringify(mode)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
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
      // --- 이 build 부분을 추가하면 됩니다 ---
      build: {
        rollupOptions: {
          input: {
            main: path.resolve(__dirname, 'index.html'),
            admin: path.resolve(__dirname, 'admin.html'),
            exchange: path.resolve(__dirname, 'exchange.html'),
            compare: path.resolve(__dirname, 'compare.html'),
            onchain: path.resolve(__dirname, 'onchain.html'),
            research: path.resolve(__dirname, 'research.html'),
          },
        },
      },
      // ---------------------------------
    };
});