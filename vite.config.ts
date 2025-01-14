import { vitePlugin as remix } from '@remix-run/dev';
import dotenv from 'dotenv';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

dotenv.config();

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    remix({
      future: {
        v3_singleFetch: true,
      },
    }),
  ],
  server: {
    port: Number(process.env.PORT),
  },
});

declare module '@remix-run/server-runtime' {
  interface Future {
    v3_singleFetch: true;
  }
}
