import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@pages': resolve(__dirname, 'src/client/pages'),
      '@store': resolve(__dirname, 'src/client/store'),
      '@services': resolve(__dirname, 'src/client/services'),
      '@components': resolve(__dirname, 'src/client/components'),
      '@theme': resolve(__dirname, 'src/client/theme'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/admin': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist/client',
  },
});
