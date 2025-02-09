import { unlink } from 'node:fs/promises';

import type { ActionFunction } from '@remix-run/node';
import {
  json,
  unstable_createFileUploadHandler,
  unstable_parseMultipartFormData,
} from '@remix-run/node';

import { redirectToLogin } from '~/auth/redirect-to-login.server';
import { db } from '~/db.server/db';
import { UPLOAD_FILE_FORM_KEY } from '~/forms/upload-file';
import { getObjectUrl, uploadFile } from '~/tigris.server/s3-client';
import { badRequest } from '~/utils/responses.server';

const MEGABYTE = 1_000_000;

export const action = (async (args) => {
  await redirectToLogin(args);

  console.log('Uploading file');

  const fileInfo = await getFileFromFormData(args.request);

  const file = await saveFileAndUploadToAzure(fileInfo);

  // Single Fetch doesn't work with Clerk
  // eslint-disable-next-line @typescript-eslint/no-deprecated
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
  const objectKey = `image/${fileInfo.name}`;
  await uploadFile({
    fileName,
    objectKey,
    contentType: fileInfo.type,
  });

  const imageFile = await db.imageFile.create({
    data: {
      name: fileInfo.name,
      url: getObjectUrl(objectKey),
    },
  });

  await unlink(fileName);

  return imageFile;
}
