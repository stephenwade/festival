import { router } from '../trpc.ts';
import { adminRouter } from './admin/index.ts';
import { authRouter } from './auth/index.ts';
import { showRouter } from './show/index.ts';

export const appRouter = router({
  auth: authRouter,
  show: showRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
