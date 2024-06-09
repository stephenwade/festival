import { unlink } from 'node:fs/promises';

import type { ActionFunction } from '@remix-run/node';
import {
  json,
  unstable_createFileUploadHandler,
  unstable_parseMultipartFormData,
} from '@remix-run/node';

import { redirectToLogin } from '~/auth/redirect-to-login.server';
import { getBlobUrl, uploadFileToAzure } from '~/azure/blob-client.server';
import { db } from '~/db.server/db';
import { UPLOAD_FILE_FORM_KEY } from '~/forms/upload-file';

const MEGABYTE = 1_000_000;

const badRequest = () => new Response('Bad Request', { status: 400 });

export const action = (async (args) => {
  await redirectToLogin(args);

  console.log('Uploading file');

  const fileInfo = await getFileFromFormData(args.request);

  const file = await saveFileAndUploadToAzure(fileInfo);

  return json(file);
}) satisfies ActionFunction;

async function getFileFromFormData(request: Request): Promise<globalThis.File> {
  const uploadHandler = unstable_createFileUploadHandler({
    directory: 'upload',
    maxPartSize: 100 * MEGABYTE,
  });

  const form = await unstable_parseMultipartFormData(request, uploadHandler);

  const file = form.get(UPLOAD_FILE_FORM_KEY);
  if (typeof file === 'string' || file === null) throw badRequest();

  return file;
}

async function saveFileAndUploadToAzure(fileInfo: File) {
  const fileName = `upload/${fileInfo.name}`;
  const blobName = `image/${fileInfo.name}`;
  await uploadFileToAzure({
    blobName,
    fileName,
    contentType: fileInfo.type,
  });

  const file = await db.file.create({
    data: {
      name: fileInfo.name,
      url: getBlobUrl(blobName),
    },
  });

  await unlink(fileName);

  return file;
}
