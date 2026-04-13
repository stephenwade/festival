import { getUserAuthStatus } from '../../auth.ts';
import { publicProcedure, router } from '../../trpc.ts';

export const authRouter = router({
  getStatus: publicProcedure.query(({ ctx }) => getUserAuthStatus(ctx.auth)),
});
