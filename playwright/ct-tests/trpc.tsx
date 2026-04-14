import { QueryClient } from '@tanstack/react-query';
import { createTRPCClient, httpLink } from '@trpc/client';
import { createTRPCMsw, httpLink as mswHttpLink } from 'msw-trpc';
import type { PropsWithChildren } from 'react';
import { useState } from 'react';

import { SharedTrpcProvider } from '../../app/trpc';
import type { AppRouter } from '../../server/routers';

function makeQueryClient() {
  return new QueryClient();
}

export function MockedTRPCProvider({ children }: PropsWithChildren) {
  const [queryClient] = useState(makeQueryClient);
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
