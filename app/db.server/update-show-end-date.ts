import { addSeconds } from 'date-fns';

import { db } from './db';

export async function updateShowEndDate(showId: string) {
  const show = await db.show.findUniqueOrThrow({
    where: { id: showId },
    include: {
      sets: {
        include: {
          audioFileUpload: {
            select: {
              audioFile: {
                select: {
                  duration: true,
                },
              },
            },
          },
        },
      },
    },
  });

  const sortedSets = [...show.sets].sort((a, b) => a.offset - b.offset);
  const lastSet = sortedSets.at(-1);
  const offset = lastSet?.offset;
  const duration = lastSet?.audioFileUpload?.audioFile?.duration;

  if (offset !== undefined && duration !== undefined) {
    const endDate = addSeconds(show.startDate, offset + duration);
    await db.show.update({
      where: { id: showId },
      data: { endDate },
    });
  } else {
    await db.show.update({
      where: { id: showId },
      data: { endDate: show.startDate },
    });
  }
}
