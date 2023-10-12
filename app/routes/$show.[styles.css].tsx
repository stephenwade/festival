import type { LoaderFunction } from '@remix-run/node';

import { db } from '~/db/db.server';

const notFound = () => new Response('Not Found', { status: 404 });

export const loader = (async ({ params }) => {
  const id = params.show!;

  const show = await db.show.findUnique({
    where: { id },
    include: {
      showLogoFile: true,
      backgroundImageFile: true,
    },
  });
  if (!show) throw notFound();

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
