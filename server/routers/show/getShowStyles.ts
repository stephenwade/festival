import { TRPCError } from '@trpc/server';

import { db } from '../../db.ts';
import { showIncludeData } from '../../types/ShowWithData.ts';
import { validateShow } from '../../util/validateShow.ts';

export async function getShowStyles(slug: string) {
  const show = await db.show.findUnique({
    where: { slug },
    include: showIncludeData,
  });
  if (!show) throw new TRPCError({ code: 'NOT_FOUND' });

  if (!validateShow(show)) throw new TRPCError({ code: 'FORBIDDEN' });

  const backgroundImage = `url(${show.backgroundImageFile.url})`;
  const backgroundColor = show.backgroundColor;
  const backgroundColorLighter = show.backgroundColorSecondary;

  return `body {
  --background-image: ${backgroundImage};
  --background-color: ${backgroundColor};
  --background-color-lighter: ${backgroundColorLighter};
}`;
}
