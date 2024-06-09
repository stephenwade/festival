import type { LoaderFunction } from '@remix-run/node';
import { redirect } from '@remix-run/node';

import { cache, INDEX_SHOW_ID_KEY } from '~/cache.server/cache';
import { db } from '~/db.server/db';

const notFound = () => new Response('Not Found', { status: 404 });

/**
 * Returns the ID of the last show that hasn't ended yet.
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
    ORDER BY startDate DESC
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

  throw notFound();
}) satisfies LoaderFunction;
