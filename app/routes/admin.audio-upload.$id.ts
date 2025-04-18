import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';

import { redirectToLogin } from '~/auth/redirect-to-login.server';
import { db } from '~/db.server/db';
import { notFound } from '~/utils/responses.server';

export const loader = (async (args) => {
  await redirectToLogin(args);

  const id = args.params.id!;

  const audioFile = await db.audioFile.findUnique({
    where: { id },
  });
  if (!audioFile) throw notFound();

  // Single Fetch doesn't work with Clerk
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  return json(audioFile);
}) satisfies LoaderFunction;
