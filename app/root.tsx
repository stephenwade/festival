import type { LinksFunction, MetaFunction } from '@remix-run/node';
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from '@remix-run/react';

import stylesUrl from './styles/global.css';

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: stylesUrl },
];

export const meta: MetaFunction = () => ({
  charset: 'utf-8',
  title: 'Festival',
  description: 'Host online music festivals',
  viewport:
    'width=device-width, minimum-scale=1, initial-scale=1, user-scalable=yes',
});

export default function App() {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />

        <script
          async
          src="https://js.sentry-cdn.com/628da201eea141708e51a4d47e2f60f3.min.js"
          crossOrigin="anonymous"
        ></script>
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
