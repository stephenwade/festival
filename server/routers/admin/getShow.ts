import { TRPCError } from '@trpc/server';
import { Temporal } from 'temporal-polyfill';

import { db } from '../../db.ts';
import { replaceNullsWithUndefined } from '../../util/replaceNullsWithUndefined.ts';

export async function getShow(id: string) {
  const show = await db.show.findUnique({
    where: { id },
    include: {
      logoImageFile: true,
      backgroundImageFile: true,
      sets: {
        include: { audioFile: true },
        orderBy: { offset: 'asc' },
      },
    },
  });
  if (!show) throw new TRPCError({ code: 'NOT_FOUND' });

  return show;
}

export async function getShowForEditing(id: string) {
  const show = await db.show.findUnique({
    where: { id },
    include: {
      sets: {
        include: { audioFile: true },
        orderBy: { offset: 'asc' },
      },
    },
  });
  if (!show) throw new TRPCError({ code: 'NOT_FOUND' });

  const startDate = show.startDate
    ? Temporal.Instant.from(show.startDate)
        .toZonedDateTimeISO(show.timeZone)
        .toPlainDateTime()
        .toString({ smallestUnit: 'second' })
    : null;

  return replaceNullsWithUndefined({ ...show, startDate });
}
