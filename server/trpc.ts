import { getAuth } from '@clerk/express';
import { initTRPC, TRPCError } from '@trpc/server';
import type { CreateExpressContextOptions } from '@trpc/server/adapters/express';

import { getUserAuthStatus } from './auth.ts';

export function createContext({ req, res }: CreateExpressContextOptions) {
  return { auth: getAuth(req), req, res };
}

type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  const status = await getUserAuthStatus(ctx.auth);

  if (status === 'unauthorized') {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  if (status === 'forbidden') {
    throw new TRPCError({ code: 'FORBIDDEN' });
  }

  return next();
});
