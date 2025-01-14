import { exec } from 'node:child_process';
import { access, constants, rename, unlink } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';

import type { AudioFile } from '@prisma/client';
import type { ActionFunction } from '@remix-run/node';
import {
  json,
  unstable_composeUploadHandlers,
  unstable_createFileUploadHandler,
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
} from '@remix-run/node';
import { z } from 'zod';

import { requireLogin } from '~/auth/redirect-to-login.server';
import { getBlobUrl, uploadFileToAzure } from '~/azure/blob-client.server';
import { db } from '~/db.server/db';
import { ffmpeg } from '~/ffmpeg.server/ffmpeg';
import type { FFprobeOutput } from '~/ffmpeg.server/ffprobe';
import { ffprobe } from '~/ffmpeg.server/ffprobe';
import { UPLOAD_DIRECTORY } from '~/forms/upload.server';
import { uploadAudioFileKeys } from '~/forms/upload-audio';
import { emitAudioFileProcessingEvent } from '~/sse.server/audio-file-events';
import { badRequest, serverError } from '~/utils/responses.server';
import { integerString } from '~/utils/zod-number-schemas';

const GIGABYTE = 1_000_000_000;
const MICROSECONDS = 1 / 1_000_000;

const execAsync = promisify(exec);

export const action = (async (args) => {
  await requireLogin(args);

  console.log('Uploading audio file chunk');

  const fileInfo = await parseForm(args.request);

  console.log('Processed file:', fileInfo);

  if (fileInfo.isLastChunk) {
    const fileName = await mergeChunks(fileInfo);
    const audioFile = await saveAudioFileToDatabase(fileName);
    emitAudioFileProcessingEvent(audioFile);

    // Run this in the background after responding to the request
    void checkAudioFile(audioFile);

    // Single Fetch doesn't work with Clerk
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    return json(audioFile);
  }

  return null;
}) satisfies ActionFunction;

function makeChunkFileName(
  uploadId: string,
  chunkNumber: number,
  extension: string,
) {
  return `${uploadId}-${chunkNumber}${extension}`;
}

const uploadHandler = unstable_composeUploadHandlers(
  // handle files
  unstable_createFileUploadHandler({
    directory: UPLOAD_DIRECTORY,
    maxPartSize: 1 * GIGABYTE,
  }),
  // handle other parts
  unstable_createMemoryUploadHandler(),
);

async function parseForm(request: Request) {
  const form = await unstable_parseMultipartFormData(request, uploadHandler);

  // Run garbage collection immediately to free up memory (and save money on
  // metered resource usage). If we don't do this, the file will be kept in
  // memory until V8 decides to run garbage collection, which doesn't happen
  // very often in a server environment.
  if (globalThis.gc) {
    globalThis.gc();
  } else {
    console.warn('globalThis.gc is not available. Run with --expose-gc flag.');
  }

  let uploadId: string;
  let chunkNumber: number;
  let isLastChunk: boolean;
  let file: File;

  try {
    uploadId = z
      .string()
      // nanoid alphabet, filename-safe
      .regex(/^[A-Za-z0-9_-]+$/u)
      .parse(form.get(uploadAudioFileKeys.uploadId));

    chunkNumber = integerString.parse(
      form.get(uploadAudioFileKeys.chunkNumber),
    );

    const totalChunks = integerString.parse(
      form.get(uploadAudioFileKeys.totalChunks),
    );
    isLastChunk = chunkNumber === totalChunks;

    const formFile = form.get(uploadAudioFileKeys.chunk);
    if (typeof formFile === 'string' || formFile === null) throw badRequest();
    file = formFile;
  } catch (error) {
    console.error(error);
    throw badRequest();
  }

  const chunkFileName = makeChunkFileName(
    uploadId,
    chunkNumber,
    path.extname(file.name),
  );

  await rename(
    `${UPLOAD_DIRECTORY}/${file.name}`,
    `${UPLOAD_DIRECTORY}/${chunkFileName}`,
  );

  return { uploadId, chunkNumber, isLastChunk, chunkFileName };
}

async function mergeChunks({
  uploadId,
  chunkNumber,
  chunkFileName,
}: Awaited<ReturnType<typeof parseForm>>) {
  const extension = path.extname(chunkFileName);

  const chunkFileNames = Array.from(
    { length: chunkNumber },
    (_, index) =>
      `${UPLOAD_DIRECTORY}/${makeChunkFileName(uploadId, index + 1, extension)}`,
  );

  const newFileName = `${UPLOAD_DIRECTORY}/${uploadId}${extension}`;

  const allAccesses = await Promise.allSettled(
    chunkFileNames.map((chunkFileName) =>
      access(chunkFileName, constants.R_OK),
    ),
  );
  if (allAccesses.some((access) => access.status === 'rejected')) {
    throw badRequest();
  }

  await execAsync(`cat ${chunkFileNames.join(' ')} > ${newFileName}`);

  await Promise.all(
    chunkFileNames.map((chunkFileName) => unlink(chunkFileName)),
  );

  return newFileName;
}

async function saveAudioFileToDatabase(name: string) {
  const audioFile = await db.audioFile.create({
    data: {
      conversionStatus: 'CHECKING',
      name,
    },
  });

  return audioFile;
}

async function checkAudioFile(file: AudioFile) {
  try {
    console.log('Checking audio file:', file.name);

    const stats = await ffprobe(file.name);
    console.log(`ffprobe stats for ${file.name}:`, stats);

    await updateAudioFileDuration(file.id, stats.format.duration);

    const needsConverting = checkNeedsConverting(stats);
    const newFileName = `${UPLOAD_DIRECTORY}/${file.id}.mp3`;
    if (needsConverting) {
      console.log('Converting audio file:', file.name);

      const streamIndex = getAudioStreamIndex(stats);
      await ffmpeg(file.name, streamIndex, newFileName, (progress) => {
        let conversionProgress: number;
        if (progress.progress === 'end') {
          conversionProgress = 1;
        } else {
          const total = stats.format.duration;
          const currentTime = progress.out_time_us * MICROSECONDS;
          conversionProgress = currentTime / total;
        }
        void updateAudioFileConvertProgress(file.id, conversionProgress);
      });
    } else {
      console.log('Audio file does not need converting:', file.name);

      await rename(file.name, newFileName);
    }

    await updateAudioFileUploading(file.id);
    const blobName = `audio/${file.id}.mp3`;
    await uploadFileToAzure({
      blobName,
      fileName: newFileName,
      contentType: 'audio/mpeg',
    });
    const url = getBlobUrl(blobName);

    await db.audioFile.update({
      where: { id: file.id },
      data: { url },
    });

    await unlink(newFileName);

    await updateAudioFileDoneProcessing(file.id);
  } catch (error) {
    await handleError(error, file.id);
  }
}

async function updateAudioFileDuration(
  fileId: AudioFile['id'],
  duration: number,
) {
  const audioFile = await db.audioFile.update({
    where: { id: fileId },
    data: { duration },
  });

  emitAudioFileProcessingEvent(audioFile);
}

async function updateAudioFileConvertProgress(
  fileId: AudioFile['id'],
  conversionProgress: number,
) {
  const audioFile = await db.audioFile.update({
    where: { id: fileId },
    data: {
      conversionStatus: 'CONVERTING',
      conversionProgress,
    },
  });

  emitAudioFileProcessingEvent(audioFile);
}

async function updateAudioFileUploading(fileId: AudioFile['id']) {
  const audioFile = await db.audioFile.update({
    where: { id: fileId },
    data: {
      conversionStatus: 'UPLOADING',
      conversionProgress: null,
    },
  });

  emitAudioFileProcessingEvent(audioFile);
}

async function updateAudioFileDoneProcessing(fileId: AudioFile['id']) {
  const audioFile = await db.audioFile.findUnique({
    where: { id: fileId },
  });

  if (!audioFile?.duration || !audioFile.url) {
    throw serverError();
  }

  const newAudioFile = await db.audioFile.update({
    where: { id: fileId },
    data: {
      conversionStatus: 'DONE',
    },
  });

  emitAudioFileProcessingEvent(newAudioFile);
}

async function handleError(error: unknown, fileId: AudioFile['id']) {
  const errorMessage = error instanceof Error ? error.message : String(error);

  console.error('Error while converting file', error);

  const audioFile = await db.audioFile.update({
    where: { id: fileId },
    data: {
      conversionStatus: 'ERROR',
      errorMessage,
    },
  });

  emitAudioFileProcessingEvent(audioFile);
}

/**
 * Checks if the file has at least 1 audio stream. If so, returns the index of
 * the audio stream. Otherwise, throws an error.
 */
function getAudioStreamIndex(stats: FFprobeOutput) {
  const streamIndex = stats.streams.findIndex(
    (stream) => stream.codec_type === 'audio',
  );

  if (streamIndex === -1) {
    throw new Error('No audio streams');
  }

  return streamIndex;
}

/**
 * Checks if the file is an MP3 file with exactly 1 audio stream and a bit rate
 * of no more than 193 Kbps.
 */
function checkNeedsConverting(stats: FFprobeOutput) {
  const MAX_BIT_RATE = 193_000;

  return !(
    stats.format.format_name === 'mp3' &&
    stats.format.bit_rate < MAX_BIT_RATE &&
    stats.streams.length === 1 &&
    stats.streams[0]!.codec_name === 'mp3' &&
    stats.streams[0]!.bit_rate &&
    stats.streams[0]!.bit_rate < MAX_BIT_RATE
  );
}
