import { vitePlugin as remix } from '@remix-run/dev';
import { defineConfig } from 'vite';

try {
  process.loadEnvFile('.env');
} catch {
  // Ignore errors if `.env` doesn't exist
}

export default defineConfig({
  plugins: [
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_lazyRouteDiscovery: true,
        v3_relativeSplatPath: true,
        v3_routeConfig: true,
        v3_throwAbortReason: true,
      },
    }),
  ],
  server: {
    port: Number(process.env.PORT),
  },
});
