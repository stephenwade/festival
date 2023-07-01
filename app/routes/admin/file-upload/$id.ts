import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';

import { db } from '~/db/db.server';

const notFound = () => new Response('Not Found', { status: 404 });

export const loader = (async ({ params }) => {
  const id = params.id as string;

  const file = await db.file.findUnique({
    where: { id },
  });
  if (!file) throw notFound();

  return json(file);
}) satisfies LoaderFunction;
