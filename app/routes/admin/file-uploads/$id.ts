import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';

import { db } from '~/db/db.server';

const notFound = () => new Response('Not Found', { status: 404 });

export const loader = (async ({ params }) => {
  const id = params.id as string;

  const fileUpload = await db.fileUpload.findUnique({
    where: { id },
    include: { file: true },
  });
  if (!fileUpload) throw notFound();

  return json(fileUpload);
}) satisfies LoaderFunction;
