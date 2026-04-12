import { expect, test as base } from '@playwright/test';
import { createTRPCClient, httpBatchLink, type TRPCClient } from '@trpc/client';

import type { AppRouter } from '../../server/routers';

const test = base.extend<{ trpc: TRPCClient<AppRouter> }>({
  trpc: async ({ baseURL }, use) => {
    if (!baseURL) {
      throw new Error('baseURL is required');
    }
    await use(
      createTRPCClient<AppRouter>({
        links: [httpBatchLink({ url: `${baseURL}/trpc` })],
      }),
    );
  },
});

test('data route omits sets that are already over', async ({ trpc }) => {
  const data = await trpc.show.getShowData.query({
    slug: process.env.SHOW_EARLIER_SLUG!,
  });

  expect(data.sets).toEqual([]);
});

test('data route redacts audio URL for the next set more than 2 minutes away', async ({
  trpc,
}) => {
  const data = await trpc.show.getShowData.query({
    slug: process.env.SHOW_LATER_SLUG!,
  });

  expect(data.sets).toHaveLength(1);
  expect(data.sets[0]?.audioUrl).toBeUndefined();
});

test('data route includes audio URL for sets that are currently playing or starting soon', async ({
  trpc,
}) => {
  const data = await trpc.show.getShowData.query({
    slug: process.env.SHOW_SLUG!,
  });

  expect(data.sets.length).toBeGreaterThan(0);
  expect(data.sets[0]?.audioUrl).toBeDefined();
});
