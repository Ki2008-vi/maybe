import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    optimizeDeps: {
      include: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
    },
    server: {
      port: 3000, // ✅ Frontend runs on port 3000
      proxy: {
        '/api': {
          target: 'http://localhost:5000', // ✅ Forwards /api calls to Express
          changeOrigin: true,
        },
      },
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});