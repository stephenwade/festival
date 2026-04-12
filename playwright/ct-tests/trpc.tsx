import { QueryClient } from '@tanstack/react-query';
import { createTRPCClient, httpLink } from '@trpc/client';
import { createTRPCMsw, httpLink as mswHttpLink } from 'msw-trpc';
import type { PropsWithChildren } from 'react';
import { useState } from 'react';

import { SharedTrpcProvider } from '../../app/trpc';
import type { AppRouter } from '../../server/routers';

let browserQueryClient: QueryClient | undefined = undefined;

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: Infinity,
        retry: false,
      },
    },
  });
}

function getQueryClient() {
  // Browser: make a new query client if we don't already have one
  // This is very important, so we don't re-make a new client if React
  // suspends during the initial render. This may not be needed if we
  // have a suspense boundary BELOW the creation of the query client
  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
}

export function MockedTRPCProvider({ children }: PropsWithChildren) {
  const queryClient = getQueryClient();
  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [httpLink({ url: '/trpc' })],
    }),
  );

  return (
    <SharedTrpcProvider queryClient={queryClient} trpcClient={trpcClient}>
      {children}
    </SharedTrpcProvider>
  );
}

export const trpcMsw = createTRPCMsw<AppRouter>({
  links: [mswHttpLink({ url: '/trpc' })],
});
