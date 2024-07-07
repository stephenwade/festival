import type { LoaderFunction } from '@remix-run/node';

import { db } from '~/db.server/db';
import { validate } from '~/types/validate';

const forbidden = () => new Response('Forbidden', { status: 403 });
const notFound = () => new Response('Not Found', { status: 404 });

export const loader = (async ({ params }) => {
  const slug = params.show!;

  const show = await db.show.findUnique({
    where: { slug },
    include: {
      logoImageFile: true,
      backgroundImageFile: true,
    },
  });
  if (!show) throw notFound();

  if (!validate(show)) throw forbidden();

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
