import { router } from '../trpc.ts';
import { showRouter } from './show/index.ts';

export const appRouter = router({
  show: showRouter,
});

export type AppRouter = typeof appRouter;
