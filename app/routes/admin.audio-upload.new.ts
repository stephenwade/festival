import { rename, unlink } from 'node:fs/promises';

import type { AudioFile } from '@prisma/client';
import type { ActionFunction } from '@remix-run/node';
import {
  json,
  unstable_createFileUploadHandler,
  unstable_parseMultipartFormData,
} from '@remix-run/node';

import { requireLogin } from '~/auth/redirect-to-login.server';
import { getBlobUrl, uploadFileToAzure } from '~/azure/blob-client.server';
import { db } from '~/db.server/db';
import { ffmpeg } from '~/ffmpeg.server/ffmpeg';
import type { FFprobeOutput } from '~/ffmpeg.server/ffprobe';
import { ffprobe } from '~/ffmpeg.server/ffprobe';
import { UPLOAD_AUDIO_FORM_KEY } from '~/forms/upload-audio';
import { emitAudioFileProcessingEvent } from '~/sse.server/audio-file-events';
import { badRequest, serverError } from '~/utils/responses.server';

const GIGABYTE = 1_000_000_000;
const MICROSECONDS = 1 / 1_000_000;

export const action = (async (args) => {
  await requireLogin(args);

  console.log('Uploading audio file');

  const fileInfo = await getFileFromFormData(args.request);

  const file = await saveAudioFileToDatabase(fileInfo.name);
  emitAudioFileProcessingEvent(file);

  // Run this in the background after responding to the request
  void checkAudioFile(file);

  // Single Fetch doesn't work with Clerk
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  return json(file);
}) satisfies ActionFunction;

async function getFileFromFormData(request: Request): Promise<globalThis.File> {
  const uploadHandler = unstable_createFileUploadHandler({
    directory: 'upload',
    maxPartSize: 1 * GIGABYTE,
  });

  const form = await unstable_parseMultipartFormData(request, uploadHandler);

  // Run garbage collection immediately to free up memory (and save money on
  // resource usage). If we don't do this, the file will be kept in memory until
  // V8 decides to run garbage collection, which doesn't happen very often in
  // a server environment.
  if (globalThis.gc) {
    globalThis.gc();
  } else {
    console.warn('globalThis.gc is not available. Run with --expose-gc flag.');
  }

  const file = form.get(UPLOAD_AUDIO_FORM_KEY);
  if (typeof file === 'string' || file === null) throw badRequest();

  return file;
}

async function saveAudioFileToDatabase(name: string) {
  const file = await db.audioFile.create({
    data: {
      conversionStatus: 'CHECKING',
      name,
    },
  });

  return file;
}

async function checkAudioFile(file: AudioFile) {
  try {
    const fileName = `upload/${file.name}`;

    console.log('Checking audio file:', fileName);

    const stats = await ffprobe(fileName);
    console.log(`ffprobe stats for ${fileName}:`, stats);

    await updateAudioFileDuration(file.id, stats.format.duration);

    const needsConverting = checkNeedsConverting(stats);
    const newFileName = `upload/${file.id}.mp3`;
    if (needsConverting) {
      console.log('Converting audio file:', fileName);

      const streamIndex = getAudioStreamIndex(stats);
      await ffmpeg(fileName, streamIndex, newFileName, (progress) => {
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
      console.log('Audio file does not need converting:', fileName);

      await rename(fileName, newFileName);
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
  const file = await db.audioFile.update({
    where: { id: fileId },
    data: { duration },
  });

  emitAudioFileProcessingEvent(file);
}

async function updateAudioFileConvertProgress(
  fileId: AudioFile['id'],
  conversionProgress: number,
) {
  const file = await db.audioFile.update({
    where: { id: fileId },
    data: {
      conversionStatus: 'CONVERTING',
      conversionProgress,
    },
  });

  emitAudioFileProcessingEvent(file);
}

async function updateAudioFileUploading(fileId: AudioFile['id']) {
  const file = await db.audioFile.update({
    where: { id: fileId },
    data: {
      conversionStatus: 'UPLOADING',
      conversionProgress: null,
    },
  });

  emitAudioFileProcessingEvent(file);
}

async function updateAudioFileDoneProcessing(fileId: AudioFile['id']) {
  const file = await db.audioFile.findUnique({
    where: { id: fileId },
  });

  if (!file?.duration || !file.url) {
    throw serverError();
  }

  const newFile = await db.audioFile.update({
    where: { id: fileId },
    data: {
      conversionStatus: 'DONE',
    },
  });

  emitAudioFileProcessingEvent(newFile);
}

async function handleError(error: unknown, fileId: AudioFile['id']) {
  const errorMessage = error instanceof Error ? error.message : String(error);

  console.error('Error while converting file', error);

  const file = await db.audioFile.update({
    where: { id: fileId },
    data: {
      conversionStatus: 'ERROR',
      errorMessage,
    },
  });

  emitAudioFileProcessingEvent(file);
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
