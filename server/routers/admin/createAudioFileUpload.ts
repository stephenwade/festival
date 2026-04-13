import path from 'node:path';

import type { AudioFile } from '@prisma/client';

import { db } from '../../db.ts';
import { getObjectUploadUrl, getObjectUrl } from '../../tigris/s3-client.ts';

interface CreateAudioFileUploadArgs {
  name: string;
  contentType: string;
}

export async function createAudioFileUpload({
  name,
  contentType,
}: CreateAudioFileUploadArgs): Promise<{ file: AudioFile; uploadUrl: string }> {
  console.log('Creating audio file upload');

  const { uploadUrl, url } = await makeObjectUrls(name, contentType);
  const file = await saveAudioFileToDatabase(name, url);

  return { file, uploadUrl };
}

async function makeObjectUrls(name: string, contentType: string) {
  const extname = path.extname(name);
  const blobName = `audio/${crypto.randomUUID()}${extname}`;

  const uploadUrl = await getObjectUploadUrl(blobName, contentType);

  const url = getObjectUrl(blobName);

  return { uploadUrl, url };
}

async function saveAudioFileToDatabase(name: string, url: string) {
  return await db.audioFile.create({
    data: {
      conversionStatus: 'USER_UPLOAD',
      name,
      url,
    },
  });
}
