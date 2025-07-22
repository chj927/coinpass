import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
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
            guide: path.resolve(__dirname, 'guide.html'),
          },
        },
      },
      // ---------------------------------
    };
});