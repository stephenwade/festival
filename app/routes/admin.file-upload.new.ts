import path from 'node:path';

import type { ActionFunction } from '@remix-run/node';
import { json } from '@remix-run/node';

import { requireLogin } from '~/auth/redirect-to-login.server';
import { db } from '~/db.server/db';
import {
  UPLOAD_FILE_CONTENT_TYPE_KEY,
  UPLOAD_FILE_NAME_KEY,
} from '~/forms/upload-file';
import { getObjectUploadUrl, getObjectUrl } from '~/tigris.server/s3-client';
import { badRequest } from '~/utils/responses.server';

export const action = (async (args) => {
  await requireLogin(args);

  console.log('Creating file upload');

  const formData = await args.request.formData();
  const name = getFileNameFromFormData(formData);
  const contentType = getContentTypeFromFormData(formData);

  const { uploadUrl, url } = await makeObjectUrls(name, contentType);

  const file = await saveFileToDatabase(name, url);

  // Single Fetch doesn't work with Clerk
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  return json({ file, uploadUrl });
}) satisfies ActionFunction;

function getFileNameFromFormData(formData: FormData): string {
  const name = formData.get(UPLOAD_FILE_NAME_KEY);
  if (typeof name !== 'string') throw badRequest();

  return name;
}

function getContentTypeFromFormData(formData: FormData): string {
  const contentType = formData.get(UPLOAD_FILE_CONTENT_TYPE_KEY);
  if (typeof contentType !== 'string') throw badRequest();

  return contentType;
}

async function makeObjectUrls(name: string, contentType: string) {
  const extname = path.extname(name);
  const blobName = `image/${crypto.randomUUID()}${extname}`;

  const uploadUrl = await getObjectUploadUrl(blobName, contentType);

  const url = getObjectUrl(blobName);

  return { uploadUrl, url };
}

async function saveFileToDatabase(name: string, url: string) {
  const file = await db.imageFile.create({
    data: {
      name,
      url,
    },
  });

  return file;
}
