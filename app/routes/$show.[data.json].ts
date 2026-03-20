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

  const showStart = Temporal.Instant.from(show.startDate);
  const now = Temporal.Now.instant();

  const sets = show.sets
    .map((set) => {
      const start = showStart.add({
        // `.add()` requires integers
        // seconds: set.offset,
        milliseconds: Math.round(set.offset * 1000),
      });
      const end = start.add({
        // `.add()` requires integers
        // seconds: set.audioFile.duration,
        milliseconds: Math.round(set.audioFile.duration * 1000),
      });

      return { set, start, end };
    })
    // Don't send sets that have already ended
    .filter(({ end }) => Temporal.Instant.compare(now, end) === -1)
    .map(({ set, start }) => ({
      id: set.id,
      audioUrl: set.audioFile.url,
      artist: set.artist,
      start: start.toString(),
      duration: set.audioFile.duration,
    }));

  const data: ShowData = {
    name: show.name,
    slug,
    description: show.description,
    showLogoUrl: show.logoImageFile.url,
    backgroundImageUrl: show.backgroundImageFile.url,
    sets,
    serverDate: Temporal.Now.instant().toString(),
  };

  // Single Fetch doesn't work with Clerk
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  return json(data);
}) satisfies LoaderFunction;
