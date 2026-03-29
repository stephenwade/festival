import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { clerkMiddleware } from '@clerk/express';
import { createRequestHandler } from '@remix-run/express';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import express from 'express';

import { appRouter } from './routers/index.ts';
import { createContext } from './trpc.ts';

const appDirectory = fileURLToPath(new URL('..', import.meta.url));
const buildClientDirectory = path.join(appDirectory, 'build', 'client');
const serverBuildPath = path.join(appDirectory, 'build', 'server', 'index.js');
const mode =
  process.env.NODE_ENV === 'production' ? 'production' : 'development';
const port = Number(process.env.PORT ?? '3000');

// https://v2.remix.run/docs/guides/vite#migrating-a-custom-server
const viteDevServer =
  mode === 'production'
    ? undefined
    : await import('vite').then(({ createServer }) =>
        createServer({
          server: { middlewareMode: true },
        }),
      );

const app = express();

app.set('trust proxy', true);

app.use(clerkMiddleware());

app.use(
  '/trpc',
  createExpressMiddleware({
    router: appRouter,
    createContext,
  }),
);

if (viteDevServer) {
  app.use(viteDevServer.middlewares);
} else {
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

const remixHandler = createRequestHandler({
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  build: viteDevServer
    ? () => viteDevServer.ssrLoadModule('virtual:remix/server-build')
    : await import(pathToFileURL(serverBuildPath).href),
  mode,
});

app.all('*', (request, response, next) => {
  Promise.resolve(remixHandler(request, response, next)).catch(next);
});

app.listen(port, () => {
  console.log(`Express server ready on port ${port}`);
});
