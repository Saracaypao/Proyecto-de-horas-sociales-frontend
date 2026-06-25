import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const backendTarget = env.VITE_BACKEND_URL ?? 'https://proyecto-de-horas-sociales-frontend.onrender.com';

  return {
    plugins: [react()],
    optimizeDeps: {
      include: ['leaflet'],
    },
    server: {
      proxy: {
        '/api': {
          target: backendTarget,
          changeOrigin: true,
        },
        '/api-docs': {
          target: backendTarget,
          changeOrigin: true,
        },
      },
      watch: {
        ignored: ['**/dist/**', '**/backend/**'],
      },
    },
  };
});