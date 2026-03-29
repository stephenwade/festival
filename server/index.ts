import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { createRequestHandler } from '@remix-run/express';
import dotenv from 'dotenv';
import express from 'express';

dotenv.config();

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

// app.get('/test', (_request, response) => {
//   response.json({
//     route: 'test',
//     server: 'express',
//     status: 'ok',
//   });
// });

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
  console.log(`Express server listening on port ${port}`);
});
