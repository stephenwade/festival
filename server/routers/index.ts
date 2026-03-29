import { publicProcedure, router } from '../trpc.ts';

export const appRouter = router({
  test: publicProcedure.query(() => ({
    route: 'test',
    source: 'trpc',
    status: 'ok',
  })),
});

export type AppRouter = typeof appRouter;
