import { TRPCError } from '@trpc/server';
import { Temporal } from 'temporal-polyfill';
import type { z } from 'zod';

import { db } from '../../db.ts';
import { makeServerValidator } from '../../schemas/show.server.ts';
import type { schema } from '../../schemas/show.ts';
import { cache, INDEX_SHOW_SLUG_KEY } from '../../util/cache.ts';
import { isDefined } from '../../util/is-defined.ts';
import { omit } from '../../util/omit.ts';
import { replaceUndefinedsWithNull } from '../../util/replaceUndefinedsWithNull.ts';

export async function updateShow(
  input: z.infer<typeof schema>,
): Promise<{ id: string }> {
  if (!input.id) {
    throw new TRPCError({ code: 'BAD_REQUEST' });
  }

  console.log('Editing show');

  const show = await db.show.findUnique({ where: { id: input.id } });
  if (!show) {
    throw new TRPCError({ code: 'NOT_FOUND' });
  }

  const validator = makeServerValidator({ previousSlug: show.slug });

  const { data, error } = await validator.validate(input);
  if (error) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      cause: error,
    });
  }

  const { startDate, sets, ...rest } = replaceUndefinedsWithNull(
    omit(data, ['id']),
  );

  const startInstant = startDate
    ? Temporal.PlainDateTime.from(startDate)
        .toZonedDateTime(rest.timeZone)
        .toInstant()
    : undefined;

  await db.show.update({
    where: { id: input.id },
    data: {
      ...rest,
      startDate: startInstant?.toString(),
      sets: {
        deleteMany: {
          id: { notIn: sets.map((set) => set.id).filter(isDefined) },
        },
        update: sets
          .filter((set) => isDefined(set.id))
          .map((set) => ({
            where: { id: set.id! },
            data: omit(set, ['id']),
          })),
        create: sets
          .filter((set) => !isDefined(set.id))
          .map((set) => omit(set, ['id'])),
      },
    },
  });

  cache.del(INDEX_SHOW_SLUG_KEY);

  return { id: input.id };
}
