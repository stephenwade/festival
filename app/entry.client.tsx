import { RemixBrowser } from '@remix-run/react';
import { StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';

import { TrpcProvider } from './trpc';

hydrateRoot(
  document,
  <StrictMode>
    <TrpcProvider>
      <HelmetProvider>
        <RemixBrowser />
      </HelmetProvider>
    </TrpcProvider>
  </StrictMode>,
);
