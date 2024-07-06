import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';

import { redirectToLogin } from '~/auth/redirect-to-login.server';
import { db } from '~/db.server/db';

const notFound = () => new Response('Not Found', { status: 404 });

export const loader = (async (args) => {
  await redirectToLogin(args);

  const id = args.params.id!;

  const imageFile = await db.imageFile.findUnique({
    where: { id },
  });
  if (!imageFile) throw notFound();

  return json(imageFile);
}) satisfies LoaderFunction;
