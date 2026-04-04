import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/cms': {
        target: 'http://directus:8055',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/cms/, ''),
      },
    },
  },
});
