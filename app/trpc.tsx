import {
  MutationCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import type { TRPCClient } from '@trpc/client';
import {
  createTRPCClient,
  httpBatchStreamLink,
  httpLink,
  httpSubscriptionLink,
  isNonJsonSerializable,
  splitLink,
  TRPCClientError,
} from '@trpc/client';
import type { inferRouterOutputs } from '@trpc/server';
import { createTRPCContext } from '@trpc/tanstack-react-query';
import { type PropsWithChildren, useState } from 'react';

import type { AppRouter } from '../server/routers/index';

const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>();

export { useTRPC };

const MAX_RETRIES = 3;

function isTRPCClientError(
  error: unknown,
): error is TRPCClientError<AppRouter> {
  return error instanceof TRPCClientError;
}

function makeQueryClient() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: (failureCount: number, error: unknown) => {
          if (failureCount >= MAX_RETRIES) {
            return false;
          }

          if (isTRPCClientError(error) && error.data) {
            const isClientError =
              error.data.httpStatus >= 400 && error.data.httpStatus < 500;
            return !isClientError;
          }

          return true;
        },
      },
    },
    mutationCache: new MutationCache({
      onSuccess: () => {
        void queryClient.invalidateQueries();
      },
    }),
  });
  return queryClient;
}

let queryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  // Make a new query client if we don't already have one
  // This is very important, so we don't re-make a new client if React
  // suspends during the initial render. This may not be needed if we
  // have a suspense boundary BELOW the creation of the query client
  queryClient ??= makeQueryClient();
  return queryClient;
}

interface SharedTrpcProviderProps extends PropsWithChildren {
  queryClient: QueryClient;
  trpcClient: TRPCClient<AppRouter>;
}

export function SharedTrpcProvider({
  children,
  queryClient,
  trpcClient,
}: SharedTrpcProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        {children}
      </TRPCProvider>
    </QueryClientProvider>
  );
}

export function TrpcProvider({ children }: PropsWithChildren) {
  const queryClient = getQueryClient();
  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [
        splitLink({
          condition: (op) => op.type === 'subscription',
          true: httpSubscriptionLink({ url: '/trpc' }),
          false: splitLink({
            condition: (op) => isNonJsonSerializable(op.input),
            true: httpLink({ url: '/trpc' }),
            false: httpBatchStreamLink({ url: '/trpc' }),
          }),
        }),
      ],
    }),
  );

  return (
    <SharedTrpcProvider queryClient={queryClient} trpcClient={trpcClient}>
      {children}
    </SharedTrpcProvider>
  );
}

export type RouterOutput = inferRouterOutputs<AppRouter>;
