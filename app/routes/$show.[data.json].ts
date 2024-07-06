import type { LoaderFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { addSeconds, formatISO } from 'date-fns';

import { db } from '~/db.server/db';
import type { ShowData } from '~/types/ShowData';

export const loader = (async ({ params }) => {
  const slug = params.show!;

  const show = await db.show.findUnique({
    where: { slug },
    include: {
      logoImageFile: true,
      backgroundImageFile: true,
      sets: {
        include: { audioFile: true },
        orderBy: { offset: 'asc' },
      },
    },
  });
  if (!show) throw redirect('/');

  if (!show.startDate) throw redirect('/');
  const data: ShowData = {
    name: show.name,
    slug,
    description: show.description ?? '',
    showLogoUrl: show.logoImageFile?.url ?? '',
    backgroundImageUrl: show.backgroundImageFile?.url ?? '',
    sets: show.sets.map((set) => ({
      id: set.id,
      audioUrl: set.audioFile?.url ?? '',
      artist: set.artist ?? '',
      start: addSeconds(show.startDate!, set.offset ?? 0).toISOString(),
      duration: set.audioFile?.duration ?? 0,
    })),
    serverDate: formatISO(new Date()),
  };

  return json(data);
}) satisfies LoaderFunction;
