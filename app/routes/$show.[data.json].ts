import { json, type LoaderFunction } from '@remix-run/node';
import { Temporal } from 'temporal-polyfill';

import { db } from '~/db.server/db';
import type { ShowData } from '~/types/ShowData';
import { showIncludeData } from '~/types/ShowWithData';
import { validateShow } from '~/types/validateShow';
import { forbidden, notFound } from '~/utils/responses.server';

export const loader = (async ({ params }) => {
  const slug = params.show!;

  const show = await db.show.findUnique({
    where: { slug },
    include: showIncludeData,
  });
  if (!show) throw notFound();

  if (!validateShow(show)) throw forbidden();

  const data: ShowData = {
    name: show.name,
    slug,
    description: show.description,
    showLogoUrl: show.logoImageFile.url,
    backgroundImageUrl: show.backgroundImageFile.url,
    sets: show.sets.map((set) => ({
      id: set.id,
      audioUrl: set.audioFile.url,
      artist: set.artist,
      start: Temporal.Instant.from(show.startDate)
        .add({ seconds: set.offset })
        .toString(),
      duration: set.audioFile.duration,
    })),
    serverDate: Temporal.Now.instant().toString(),
  };

  // Single Fetch doesn't work with Clerk
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  return json(data);
}) satisfies LoaderFunction;
