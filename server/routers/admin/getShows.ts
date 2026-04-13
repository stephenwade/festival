import { db } from '../../../app/db.server/db.ts';
import { showIncludeData } from '../../../app/types/ShowWithData.ts';
import { omit } from '../../../app/utils/omit.ts';
import { validateShow } from '../../util/validateShow.ts';

export async function getShows() {
  const shows = await db.show.findMany({
    include: showIncludeData,
  });

  return shows.map((show) => ({
    ...omit(
      show,
      Object.keys(showIncludeData) as (keyof typeof showIncludeData)[],
    ),
    isValid: validateShow(show),
  }));
}
