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

      // --- 이 부분을 추가하면 됩니다 ---
      preview: {
        host: true, // 외부 접속 허용
        port: 8080, // Render가 선호하는 포트
        strictPort: true,
        allowedHosts: [
          'coinpass.onrender.com', // 우리 서비스 주소 허용
          'coinpass.kr',
          'www.coinpass.kr',

        ],
      }
      // --------------------------
    };
});