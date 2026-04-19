import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { AppRouter } from './router';
import { TrpcProvider } from './trpc';

createRoot(document.querySelector('#root')!).render(
  <StrictMode>
    <TrpcProvider>
      <AppRouter />
    </TrpcProvider>
  </StrictMode>,
);
