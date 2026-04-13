import { TRPCError } from '@trpc/server';
import { Temporal } from 'temporal-polyfill';
import type { z } from 'zod';

import { db } from '../../db.ts';
import { makeServerValidator } from '../../schemas/show.server.ts';
import type { schema } from '../../schemas/show.ts';
import { cache, INDEX_SHOW_SLUG_KEY } from '../../util/cache.ts';
import { omit } from '../../util/omit.ts';

export async function createShow(
  input: z.infer<typeof schema>,
): Promise<{ id: string }> {
  if (input.id) {
    throw new TRPCError({ code: 'BAD_REQUEST' });
  }

  console.log('Creating new show');

  const validator = makeServerValidator();

  const { data, error } = await validator.validate(input);
  if (error) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      cause: error,
    });
  }

  const { startDate, sets, ...rest } = omit(data, ['id']);

  const startInstant = startDate
    ? Temporal.PlainDateTime.from(startDate)
        .toZonedDateTime(rest.timeZone)
        .toInstant()
    : undefined;

  const show = await db.show.create({
    data: {
      ...rest,
      startDate: startInstant?.toString(),
      sets: { create: sets },
    },
  });

  cache.del(INDEX_SHOW_SLUG_KEY);

  return { id: show.id };
}
