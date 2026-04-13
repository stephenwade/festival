import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { clerkMiddleware } from '@clerk/express';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import express from 'express';
import ViteExpress from 'vite-express';

import { appRouter } from './routers/index.ts';
import { createContext } from './trpc.ts';

const appDirectory = fileURLToPath(new URL('..', import.meta.url));
const buildClientDirectory = path.join(appDirectory, 'build', 'client');
const mode =
  process.env.NODE_ENV === 'production' ? 'production' : 'development';
const port = Number(process.env.PORT ?? '3000');

const app = express();

app.set('trust proxy', true);

ViteExpress.config({
  mode,
  ignorePaths: /^\/trpc(?:\/|$)/,
});

app.use(
  clerkMiddleware({
    publishableKey: process.env.VITE_CLERK_PUBLISHABLE_KEY,
  }),
);

app.use(
  '/trpc',
  createExpressMiddleware({
    router: appRouter,
    createContext,
  }),
);

if (mode === 'production') {
  app.use(
    '/assets',
    express.static(path.join(buildClientDirectory, 'assets'), {
      immutable: true,
      index: false,
      maxAge: '1y',
    }),
  );
  app.use(
    express.static(buildClientDirectory, {
      index: false,
      maxAge: '1h',
    }),
  );
}

ViteExpress.listen(app, port, () => {
  console.log(`Express server ready on port ${port}`);
});
