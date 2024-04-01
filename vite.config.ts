import { vitePlugin as remix } from '@remix-run/dev';
import dotenv from 'dotenv';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

dotenv.config();

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    remix({
      serverModuleFormat: 'cjs',
    }),
  ],
  server: {
    port: Number(process.env.PORT),
  },
});
