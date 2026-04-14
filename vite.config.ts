import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

try {
  process.loadEnvFile('.env');
} catch {
  // Ignore errors if `.env` doesn't exist
}

export default defineConfig({
  plugins: [react()],
  server: {
    port: Number(process.env.PORT),
  },
});
