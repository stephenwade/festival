import { vitePlugin as remix } from '@remix-run/dev';
import { installGlobals } from '@remix-run/node';
import dotenv from 'dotenv';
import { defineConfig } from 'vite';
import envOnly from 'vite-env-only';
import tsconfigPaths from 'vite-tsconfig-paths';

installGlobals();

dotenv.config();

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    envOnly(),
    remix({
      serverModuleFormat: 'cjs',
    }),
  ],
  server: {
    port: Number(process.env.PORT),
  },
});
