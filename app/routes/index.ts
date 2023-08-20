import type { LoaderFunction } from '@remix-run/node';
import { redirect } from '@remix-run/node';

import { db } from '~/db/db.server';

const notFound = () => new Response('Not Found', { status: 404 });

export const loader = (async () => {
  const show = await db.show.findFirst({
    orderBy: { startDate: 'asc' },
  });
  if (!show) throw notFound();

  return redirect(`/${show.id}`);
}) satisfies LoaderFunction;
