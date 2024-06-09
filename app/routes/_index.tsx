import '~/styles/show.css';
import '~/styles/index.css';

import type { LoaderFunction } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import type { FC } from 'react';

import { cache, INDEX_SHOW_ID_KEY } from '~/cache.server/cache';
import { db } from '~/db.server/db';

/**
 * Returns the ID of the earliest show that hasn't ended yet.
 */
async function calculateIndexShowId(): Promise<string | null> {
  const result = await db.$queryRaw<{ id: string }[]>`
    WITH ShowsWithEndDate AS (
      SELECT
        \`Show\`.id,
        \`Show\`.startDate,
        TIMESTAMPADD(SECOND, SetRows.offset + AudioFile.duration, \`Show\`.startDate) as endDate
      FROM \`Show\`
      JOIN (
        SELECT
          \`Set\`.offset,
          \`Set\`.showId,
          \`Set\`.audioFileUploadId,
          ROW_NUMBER() OVER (PARTITION BY showId ORDER BY offset DESC) AS rowNumber
        FROM \`Set\`
      ) AS SetRows ON \`Show\`.id = SetRows.showId AND SetRows.rowNumber = 1
      JOIN AudioFileUpload ON SetRows.audioFileUploadId = AudioFileUpload.id
      JOIN AudioFile ON AudioFileUpload.id = AudioFile.audioFileUploadId
    )
    SELECT id
    FROM ShowsWithEndDate
    WHERE endDate >= NOW()
    ORDER BY startDate ASC
    LIMIT 1
  `;

  if (result.length === 0) return null;

  return result[0].id;
}

async function getIndexShowId(): ReturnType<typeof calculateIndexShowId> {
  const cachedValue =
    cache.get<Awaited<ReturnType<typeof calculateIndexShowId>>>(
      INDEX_SHOW_ID_KEY,
    );
  if (cachedValue !== undefined) {
    return cachedValue;
  }

  const showId = await calculateIndexShowId();
  cache.set(INDEX_SHOW_ID_KEY, showId);

  return showId;
}

export const loader = (async () => {
  const indexShowId = await getIndexShowId();
  if (indexShowId) return redirect(`/${indexShowId}`);

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
