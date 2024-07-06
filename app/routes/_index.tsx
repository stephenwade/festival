import '~/styles/show.css';
import '~/styles/index.css';

import type { LoaderFunction } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import type { FC } from 'react';

import { cache, INDEX_SHOW_SLUG_KEY } from '~/cache.server/cache';
import { db } from '~/db.server/db';

/**
 * Returns the slug of the earliest show that hasn't ended yet.
 */
async function calculateIndexShowSlug(): Promise<string | null> {
  const result = await db.$queryRaw<{ slug: string }[]>`
    WITH ShowsWithEndDate AS (
      SELECT
        \`Show\`.slug,
        \`Show\`.startDate,
        TIMESTAMPADD(SECOND, SetRows.offset + AudioFile.duration, \`Show\`.startDate) as endDate
      FROM \`Show\`
      JOIN (
        SELECT
          \`Set\`.offset,
          \`Set\`.showId,
          \`Set\`.audioFileId,
          ROW_NUMBER() OVER (PARTITION BY showId ORDER BY offset DESC) AS rowNumber
        FROM \`Set\`
      ) AS SetRows ON \`Show\`.id = SetRows.showId AND SetRows.rowNumber = 1
      JOIN AudioFile ON SetRows.audioFileId = AudioFile.id
    )
    SELECT slug
    FROM ShowsWithEndDate
    WHERE endDate >= NOW()
    ORDER BY startDate ASC
    LIMIT 1
  `;

  if (result.length === 0) return null;

  return result[0].slug;
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
