import { QueryClient } from '@tanstack/react-query';
import {
  httpBatchStreamLink,
  httpSubscriptionLink,
  splitLink,
} from '@trpc/client';
import { createTRPCReact } from '@trpc/react-query';
import { type PropsWithChildren, useState } from 'react';

import type { AppRouter } from '../server/routers/index.ts';

export const trpc = createTRPCReact<AppRouter>();

export function TrpcProvider({ children }: PropsWithChildren) {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        splitLink({
          condition: (op) => op.type === 'subscription',
          true: httpSubscriptionLink({ url: '/trpc' }),
          false: httpBatchStreamLink({ url: '/trpc' }),
        }),
      ],
    }),
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      {children}
    </trpc.Provider>
  );
}
