import '~/styles/show.css';
import '~/styles/index.css';

import type { LoaderFunction } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import type { FC } from 'react';
import { Temporal } from 'temporal-polyfill';

import { cache, INDEX_SHOW_SLUG_KEY } from '~/cache.server/cache';
import { db } from '~/db.server/db';
import { showIncludeData } from '~/types/ShowWithData';
import { validateShow } from '~/types/validateShow';

function isAfter(a: Temporal.Instant, b: Temporal.Instant): boolean {
  return Temporal.Instant.compare(a, b) === 1;
}

/**
 * Returns the slug of the earliest show that hasn't ended yet.
 */
async function calculateIndexShowSlug(): Promise<string | null> {
  const shows = await db.show.findMany({
    include: showIncludeData,
  });

  const validShows = shows.filter(validateShow);

  const showsWithEndDate = validShows.map((show) => {
    // `validateShow` ensures there's at least one set
    const lastSet = show.sets.at(-1)!;

    const startDate = Temporal.Instant.from(show.startDate);

    return {
      slug: show.slug,
      startDate,
      endDate: startDate.add({
        // `.add()` requires integers
        // seconds: lastSet.offset + lastSet.audioFile.duration,
        milliseconds: Math.round(
          (lastSet.offset + lastSet.audioFile.duration) * 1000,
        ),
      }),
    };
  });

  const upcomingShows = showsWithEndDate.filter(({ endDate }) =>
    isAfter(endDate, Temporal.Now.instant()),
  );

  upcomingShows.sort((a, b) =>
    Temporal.Instant.compare(a.startDate, b.startDate),
  );

  return upcomingShows[0]?.slug ?? null;
}

async function getIndexShowSlug(): ReturnType<typeof calculateIndexShowSlug> {
  const cachedValue =
    cache.get<Awaited<ReturnType<typeof calculateIndexShowSlug>>>(
      INDEX_SHOW_SLUG_KEY,
    );
  if (cachedValue !== undefined) {
    return cachedValue;
  }

  const slug = await calculateIndexShowSlug();
  cache.set(INDEX_SHOW_SLUG_KEY, slug);

  return slug;
}

export const loader = (async () => {
  const indexShowSlug = await getIndexShowSlug();
  if (indexShowSlug) return redirect(`/${indexShowSlug}`);

  return null;
}) satisfies LoaderFunction;

const Index: FC = () => (
  <div className="index-container full-page">
    <img className="logo" src="/images/festival.svg" alt="FESTIVAL" />
    <div className="attribution">
      Photo by <a href="https://unsplash.com/@yvettedewit">Yvette de Wit</a> on{' '}
      <a href="https://unsplash.com/photos/group-of-people-attending-a-performance-8XLapfNMW04">
        Unsplash
      </a>
    </div>
  </div>
);

export default Index;
