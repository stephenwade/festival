import type { ActionFunction } from '@remix-run/node';
import {
  json,
  unstable_createFileUploadHandler,
  unstable_parseMultipartFormData,
} from '@remix-run/node';

import { db } from '~/db/db.server';

const GIGABYTE = 1_000_000_000;

const notFound = () => new Response('Not Found', { status: 404 });

export const action: ActionFunction = async ({ params, request }) => {
  const id = params.show as string;
  const show = await db.show.findUnique({ where: { id } });
  if (!show) throw notFound();

  const uploadHandler = unstable_createFileUploadHandler({
    directory: 'upload',
    maxPartSize: 1 * GIGABYTE,
  });

  const form = await unstable_parseMultipartFormData(request, uploadHandler);

  const files = Object.fromEntries(
    [...form.keys()].map((key) => [key, (form.get(key) as File).name])
  );

  return json(files);
};
