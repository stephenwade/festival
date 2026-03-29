import { RemixBrowser } from '@remix-run/react';
import { StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';

hydrateRoot(
  document,
  <StrictMode>
    <HelmetProvider>
      <RemixBrowser />
    </HelmetProvider>
  </StrictMode>,
);
