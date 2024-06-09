import type { LoaderFunction } from '@remix-run/node';
import { redirect } from '@remix-run/node';

import { db } from '~/db.server/db';

const notFound = () => new Response('Not Found', { status: 404 });

export const loader = (async () => {
  const show = await db.show.findFirst({
    // Find the last show that hasn't ended yet
    where: { endDate: { gte: new Date() } },
    orderBy: { startDate: 'desc' },
  });
  if (!show) throw notFound();

  return redirect(`/${show.id}`);
}) satisfies LoaderFunction;
