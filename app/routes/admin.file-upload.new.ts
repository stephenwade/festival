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
import { UPLOAD_DIRECTORY } from '~/forms/upload.server';
import { UPLOAD_FILE_FORM_KEY } from '~/forms/upload-file';
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

const uploadHandler = unstable_createFileUploadHandler({
  directory: UPLOAD_DIRECTORY,
  maxPartSize: 100 * MEGABYTE,
});

async function getFileFromFormData(request: Request): Promise<File> {
  const form = await unstable_parseMultipartFormData(request, uploadHandler);

  const file = form.get(UPLOAD_FILE_FORM_KEY);
  if (typeof file === 'string' || file === null) throw badRequest();

  return file;
}

async function saveFileAndUploadToAzure(fileInfo: File) {
  const fileName = `${UPLOAD_DIRECTORY}/${fileInfo.name}`;
  const blobName = `image/${fileInfo.name}`;
  await uploadFileToAzure({
    blobName,
    fileName,
    contentType: fileInfo.type,
  });

  const imageFile = await db.imageFile.create({
    data: {
      name: fileInfo.name,
      url: getBlobUrl(blobName),
    },
  });

  await unlink(fileName);

  return imageFile;
}
