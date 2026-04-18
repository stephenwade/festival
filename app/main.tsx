import { ClerkProvider } from '@clerk/react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { AppRouter } from './router';
import { TrpcProvider } from './trpc';

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error('Add VITE_CLERK_PUBLISHABLE_KEY to your environment.');
}

createRoot(document.querySelector('#root')!).render(
  <StrictMode>
    <ClerkProvider
      publishableKey={publishableKey}
      signInUrl="/admin/sign-in"
      signUpUrl="/admin/sign-up"
      signInFallbackRedirectUrl="/admin"
      signUpFallbackRedirectUrl="/admin"
      afterSignOutUrl="/admin"
    >
      <TrpcProvider>
        <AppRouter />
      </TrpcProvider>
    </ClerkProvider>
  </StrictMode>,
);
