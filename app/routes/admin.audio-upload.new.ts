import path from 'node:path';

import type { ActionFunction } from '@remix-run/node';
import { json } from '@remix-run/node';

import { requireLogin } from '~/auth/redirect-to-login.server';
import { getBlobSasUrl, getBlobUrl } from '~/azure/blob-client.server';
import { db } from '~/db.server/db';
import {
  UPLOAD_AUDIO_CONTENT_TYPE_KEY,
  UPLOAD_AUDIO_NAME_KEY,
} from '~/forms/upload-audio';
import { badRequest } from '~/utils/responses.server';

export const action = (async (args) => {
  await requireLogin(args);

  console.log('Creating audio file upload');

  const formData = await args.request.formData();
  const name = getFileNameFromFormData(formData);
  const contentType = getContentTypeFromFormData(formData);

  const { uploadUrl, url } = await getBlobUrls(name, contentType);

  const file = await saveAudioFileToDatabase(name, url);

  // Single Fetch doesn't work with Clerk
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  return json({ file, uploadUrl });
}) satisfies ActionFunction;

function getFileNameFromFormData(formData: FormData): string {
  const name = formData.get(UPLOAD_AUDIO_NAME_KEY);
  if (typeof name !== 'string') throw badRequest();

  return name;
}

function getContentTypeFromFormData(formData: FormData): string {
  const contentType = formData.get(UPLOAD_AUDIO_CONTENT_TYPE_KEY);
  if (typeof contentType !== 'string') throw badRequest();

  return contentType;
}

async function getBlobUrls(name: string, contentType: string) {
  const extname = path.extname(name);
  const blobName = `upload/${globalThis.crypto.randomUUID()}${extname}`;

  const uploadUrl = await getBlobSasUrl(blobName, contentType);

  const url = getBlobUrl(blobName);

  return { uploadUrl, url };
}

async function saveAudioFileToDatabase(name: string, url: string) {
  const file = await db.audioFile.create({
    data: {
      conversionStatus: 'USER_UPLOAD',
      name,
      url,
    },
  });

  return file;
}
