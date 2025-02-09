import { createReadStream } from 'node:fs';

import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const accessKeyId = process.env.TIGRIS_ACCESS_KEY_ID;
const secretAccessKey = process.env.TIGRIS_SECRET_ACCESS_KEY;
const bucket = process.env.TIGRIS_BUCKET;

if (!accessKeyId || !secretAccessKey || !bucket) {
  throw new Error(
    'TIGRIS_ACCESS_KEY_ID, TIGRIS_SECRET_ACCESS_KEY, and TIGRIS_BUCKET must be set',
  );
}

const S3 = new S3Client({
  region: 'auto',
  endpoint: 'https://fly.storage.tigris.dev',
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

export function getObjectUrl(objectKey: string) {
  return `https://${bucket!}.fly.storage.tigris.dev/${objectKey}`;
}

export async function getObjectUploadUrl(
  objectKey: string,
  contentType: string,
) {
  return await getSignedUrl(
    S3,
    new PutObjectCommand({
      Bucket: bucket,
      Key: objectKey,
      ContentType: contentType,
    }),
  );
}

interface UploadFileToTigrisProps {
  fileName: string;
  objectKey: string;
  contentType: string;
}

export async function uploadFile({
  fileName,
  objectKey,
  contentType,
}: UploadFileToTigrisProps) {
  console.log('Uploading file to Tigris', { fileName, objectKey, contentType });

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: objectKey,
    Body: createReadStream(fileName),
    ContentType: contentType,
  });

  await S3.send(command);
}

export async function deleteObjectByUrl(url: string) {
  const objectKey = url.replace(
    `https://${bucket!}.fly.storage.tigris.dev/`,
    '',
  );
  if (objectKey.startsWith('http')) {
    throw new Error('Invalid URL');
  }

  console.log('Deleting object from Tigris', { objectKey });

  const command = new DeleteObjectCommand({
    Bucket: bucket,
    Key: objectKey,
  });

  await S3.send(command);
}
