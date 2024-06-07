import type { LoaderFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { addSeconds, formatISO } from 'date-fns';

import { db } from '~/db/db.server';
import type { ShowData } from '~/types/ShowData';

export const loader = (async ({ params }) => {
  const id = params.show!;

  const show = await db.show.findUnique({
    where: { id },
    include: {
      showLogoFile: true,
      backgroundImageFile: true,
      sets: {
        include: {
          audioFileUpload: { select: { audioFile: true } },
        },
        orderBy: { offset: 'asc' },
      },
    },
  });
  if (!show) throw redirect('/');

  const data: ShowData = {
    id,
    name: show.name,
    description: show.description,
    showLogoUrl: show.showLogoFile.url,
    backgroundImageUrl: show.backgroundImageFile.url,
    sets: show.sets.map((set) => ({
      id: set.id,
      audioUrl: set.audioFileUpload?.audioFile?.audioUrl ?? '',
      artist: set.artist,
      start: addSeconds(show.startDate, set.offset).toISOString(),
      duration: set.audioFileUpload?.audioFile?.duration ?? 0,
    })),
    serverDate: formatISO(new Date()),
  };

  return json(data);
}) satisfies LoaderFunction;
