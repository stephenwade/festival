import type { LoaderFunction } from '@remix-run/node';

import { db } from '~/db.server/db';
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

  const backgroundImage = `url(${show.backgroundImageFile.url})`;
  const backgroundColor = show.backgroundColor;
  const backgroundColorLighter = show.backgroundColorSecondary;

  return new Response(
    `body {
  --background-image: ${backgroundImage};
  --background-color: ${backgroundColor};
  --background-color-lighter: ${backgroundColorLighter};
}`,
    { headers: { 'content-type': 'text/css' } },
  );
}) satisfies LoaderFunction;
