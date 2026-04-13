import { Temporal } from 'temporal-polyfill';

import { db } from '../../db.ts';
import { showIncludeData } from '../../types/ShowWithData.ts';
import { cache, INDEX_SHOW_SLUG_KEY } from '../../util/cache.ts';
import { validateShow } from '../../util/validateShow.ts';

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

  const now = Temporal.Now.instant();
  const upcomingShows = showsWithEndDate.filter(({ endDate }) =>
    isAfter(endDate, now),
  );

  upcomingShows.sort((a, b) =>
    Temporal.Instant.compare(a.startDate, b.startDate),
  );

  return upcomingShows[0]?.slug ?? null;
}

export async function getIndexShowSlug(): ReturnType<
  typeof calculateIndexShowSlug
> {
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
