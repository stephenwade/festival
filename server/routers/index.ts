import { router } from '../trpc.ts';
import { adminRouter } from './admin/index.ts';
import { showRouter } from './show/index.ts';

export const appRouter = router({
  show: showRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
