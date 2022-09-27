import type { LinksFunction, MetaFunction } from '@remix-run/node';
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from '@remix-run/react';
import { useEffect, useState } from 'react';
import checkWebP from 'supports-webp';

import elevationStylesUrl from './styles/elevation.css';
import globalStylesUrl from './styles/global.css';

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: globalStylesUrl },
  { rel: 'stylesheet', href: elevationStylesUrl },
];

export const meta: MetaFunction = () => ({
  charset: 'utf-8',
  title: 'Festival',
  description: 'Host online music festivals',
  viewport:
    'width=device-width, minimum-scale=1, initial-scale=1, user-scalable=yes',
});

export default function App() {
  const [htmlClassName, setHtmlClassName] = useState<string>();

  useEffect(() => {
    checkWebP
      .then((supported) => {
        if (supported) {
          setHtmlClassName('webp');
        } else {
          setHtmlClassName('no-webp');
        }
      })
      .catch(() => {
        setHtmlClassName('no-webp');
      });
  }, []);

  return (
    <html lang="en" className={htmlClassName}>
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
