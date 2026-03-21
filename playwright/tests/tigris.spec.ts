import { randomBytes, randomUUID } from 'node:crypto';

import { expect, test } from '@playwright/test';

import {
  deleteObjectByUrl,
  getObjectUploadUrl,
  getObjectUrl,
} from '~/tigris.server/s3-client';

test('presigned upload URL can upload, download, and delete blob data', async ({}) => {
  const objectKey = `test/${randomUUID()}.bin`;
  const contentType = 'application/octet-stream';
  const sourceData = randomBytes(512);
  const uploadUrl = await getObjectUploadUrl(objectKey, contentType);
  const fileUrl = getObjectUrl(objectKey);

  try {
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'content-type': contentType,
      },
      body: sourceData,
    });

    expect(uploadResponse.ok).toBeTruthy();

    const downloadResponse = await fetch(fileUrl);
    expect(downloadResponse.ok).toBeTruthy();

    const downloadedData = Buffer.from(await downloadResponse.arrayBuffer());

    expect(downloadedData.equals(sourceData)).toBeTruthy();
  } finally {
    await deleteObjectByUrl(fileUrl);
  }
});
