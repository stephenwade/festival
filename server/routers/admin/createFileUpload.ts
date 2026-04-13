import path from 'node:path';

import { db } from '../../db.ts';
import { getObjectUploadUrl, getObjectUrl } from '../../tigris/s3-client.ts';

interface CreateFileUploadArgs {
  name: string;
  contentType: string;
}

export async function createFileUpload({
  name,
  contentType,
}: CreateFileUploadArgs) {
  console.log('Creating file upload');

  const { uploadUrl, url } = await makeObjectUrls(name, contentType);
  const file = await saveFileToDatabase(name, url);

  return { file, uploadUrl };
}

async function makeObjectUrls(name: string, contentType: string) {
  const extname = path.extname(name);
  const blobName = `image/${crypto.randomUUID()}${extname}`;

  const uploadUrl = await getObjectUploadUrl(blobName, contentType);

  const url = getObjectUrl(blobName);

  return { uploadUrl, url };
}

async function saveFileToDatabase(name: string, url: string) {
  return await db.imageFile.create({
    data: {
      name,
      url,
    },
  });
}
