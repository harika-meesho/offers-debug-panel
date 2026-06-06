import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  const supplierOptinBase =
    env.VITE_SUPPLIER_OPTIN_ADMIN_BASE_URL || 'http://localhost:8080';
  const offerPlatformBase =
    env.VITE_OFFER_PLATFORM_BASE_URL || 'http://localhost:8081';
  const offerPlatformToken = env.VITE_OFFER_PLATFORM_AUTH_TOKEN || '';

  // offer-platform-go requires client-id + client-token headers (not Authorization: Bearer)
  const offerPlatformHeaders: Record<string, string> = {
    'client-id': '10000',
    'Content-Type': 'application/json',
    ...(offerPlatformToken ? { 'client-token': offerPlatformToken } : {}),
  };

  return {
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
        // supplier-optin admin service
        '/api/v1/optin':      { target: supplierOptinBase, changeOrigin: true },
        '/admin/v2/supplier': { target: supplierOptinBase, changeOrigin: true },
        '/admin/supplier':    { target: supplierOptinBase, changeOrigin: true },
        // offer-platform-go — requires client-id + client-token
        '/admin/debug/panel': {
          target: offerPlatformBase,
          changeOrigin: true,
          headers: offerPlatformHeaders,
        },
        '/v2/debug/panel': {
          target: offerPlatformBase,
          changeOrigin: true,
          headers: offerPlatformHeaders,
        },
        '/admin/productsupplier': {
          target: offerPlatformBase,
          changeOrigin: true,
          headers: offerPlatformHeaders,
        },
        '/admin/offerdetails': {
          target: offerPlatformBase,
          changeOrigin: true,
          headers: offerPlatformHeaders,
        },
      },
    },
    build: {
      outDir: 'dist/client',
    },
  };
});
