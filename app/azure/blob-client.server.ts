import {
  BlobSASPermissions,
  BlobServiceClient,
  StorageSharedKeyCredential,
} from '@azure/storage-blob';
import { addHours } from 'date-fns';

const account = process.env.AZURE_STORAGE_ACCOUNT;
const accountKey = process.env.AZURE_STORAGE_KEY;
const websiteHostingDomain = process.env.AZURE_STORAGE_WEBSITE_DOMAIN;

if (!account || !accountKey || !websiteHostingDomain) {
  throw new Error(
    'AZURE_STORAGE_ACCOUNT, AZURE_STORAGE_KEY, and AZURE_STORAGE_WEBSITE_URL must be set',
  );
}

const sharedKeyCredential = new StorageSharedKeyCredential(account, accountKey);

const blobServiceClient = new BlobServiceClient(
  `https://${account}.blob.core.windows.net`,
  sharedKeyCredential,
);

const containerName = '$web';

const containerClient = blobServiceClient.getContainerClient(containerName);

export function getBlobUrl(blobName: string) {
  return `https://${websiteHostingDomain!}/${blobName}`;
}

interface UploadFileToAzureProps {
  blobName: string;
  fileName: string;
  contentType: string;
}

const writePermissions = BlobSASPermissions.parse('w');

export async function getBlobSasUrl(blobName: string, contentType: string) {
  const blobClient = containerClient.getBlockBlobClient(blobName);

  const expiresOn = addHours(new Date(), 1);

  const sas = await blobClient.generateSasUrl({
    permissions: writePermissions,
    expiresOn,
    contentType,
  });

  return sas;
}

export async function uploadFileToAzure({
  blobName,
  fileName,
  contentType,
}: UploadFileToAzureProps) {
  console.log('Uploading file to Azure', { blobName, fileName, contentType });

  const blobClient = containerClient.getBlockBlobClient(blobName);

  await blobClient.uploadFile(fileName, {
    blobHTTPHeaders: { blobContentType: contentType },
  });
}
