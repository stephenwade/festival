import { ClerkApp, ClerkCatchBoundary } from '@clerk/remix';
import { rootAuthLoader } from '@clerk/remix/ssr.server';
import type { LoaderFunction, V2_MetaFunction } from '@remix-run/node';
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from '@remix-run/react';

export const meta: V2_MetaFunction = () => [
  { title: 'Festival' },
  { name: 'description', content: 'Host online music festivals' },
];

export const loader = rootAuthLoader satisfies LoaderFunction;

export const CatchBoundary = ClerkCatchBoundary();

function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, minimum-scale=1, initial-scale=1, user-scalable=yes"
        />
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

export default ClerkApp(App);
