import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';

import { redirectToLogin } from '~/auth/redirect-to-login.server';
import { db } from '~/db/db.server';

const notFound = () => new Response('Not Found', { status: 404 });

export const loader = (async (args) => {
  await redirectToLogin(args);

  const id = args.params.id!;

  const audioFileUpload = await db.audioFileUpload.findUnique({
    where: { id },
    include: { audioFile: true },
  });
  if (!audioFileUpload) throw notFound();

  return json(audioFileUpload);
}) satisfies LoaderFunction;
