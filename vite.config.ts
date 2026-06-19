import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const backendTarget = process.env.VITE_BACKEND_URL ?? 'https://proyecto-de-horas-sociales-frontend.onrender.com';

export default defineConfig({
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
});