import type { EntryContext } from '@remix-run/node';
import { RemixServer } from '@remix-run/react';
import { renderToString } from 'react-dom/server';
import { HelmetProvider, type HelmetServerState } from 'react-helmet-async';

import { TrpcProvider } from './trpc';

function renderHelmetMarkup(helmet: HelmetServerState) {
  return [
    helmet.base.toString(),
    helmet.title.toString(),
    helmet.priority.toString(),
    helmet.meta.toString(),
    helmet.link.toString(),
    helmet.style.toString(),
    helmet.script.toString(),
    helmet.noscript.toString(),
  ].join('');
}

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
) {
  const helmetContext: Record<string, unknown> = {};

  const markup = renderToString(
    <TrpcProvider>
      <HelmetProvider context={helmetContext}>
        <RemixServer context={remixContext} url={request.url} />
      </HelmetProvider>
    </TrpcProvider>,
  );
  const markupWithHelmet = markup.replace(
    '</head>',
    `${renderHelmetMarkup(helmetContext.helmet as HelmetServerState)}</head>`,
  );

  responseHeaders.set('content-type', 'text/html');

  return new Response('<!DOCTYPE html>' + markupWithHelmet, {
    status: responseStatusCode,
    headers: responseHeaders,
  });
}
