import { rename, unlink } from 'node:fs/promises';

import type { AudioFileUpload } from '@prisma/client';
import type { ActionFunction } from '@remix-run/node';
import {
  json,
  unstable_createFileUploadHandler,
  unstable_parseMultipartFormData,
} from '@remix-run/node';

import { redirectToLogin } from '~/auth/redirect-to-login.server';
import { getBlobUrl, uploadFileToAzure } from '~/azure/blob-client.server';
import { db } from '~/db/db.server';
import { ffmpeg } from '~/ffmpeg/ffmpeg.server';
import type { FFprobeOutput } from '~/ffmpeg/ffprobe.server';
import { ffprobe } from '~/ffmpeg/ffprobe.server';
import { UPLOAD_AUDIO_FORM_KEY } from '~/forms/upload-audio';
import { emitAudioFileProcessingEvent } from '~/routes/admin.audio-upload.events';

const GIGABYTE = 1_000_000_000;
const MICROSECONDS = 1 / 1_000_000;

const badRequest = () => new Response('Bad Request', { status: 400 });
const serverError = () =>
  new Response('Internal Server Error', { status: 500 });

export const action = (async (args) => {
  await redirectToLogin(args);

  const fileInfo = await getFileFromFormData(args.request);

  const fileUpload = await saveAudioFileUploadToDatabase(fileInfo.name);
  emitAudioFileProcessingEvent(fileUpload);

  // Run this in the background after responding to the request
  void processAudioFileUpload(fileUpload);

  return json(fileUpload);
}) satisfies ActionFunction;

async function getFileFromFormData(request: Request): Promise<globalThis.File> {
  const uploadHandler = unstable_createFileUploadHandler({
    directory: 'upload',
    maxPartSize: 1 * GIGABYTE,
  });

  const form = await unstable_parseMultipartFormData(request, uploadHandler);

  const file = form.get(UPLOAD_AUDIO_FORM_KEY);
  if (typeof file === 'string' || file === null) throw badRequest();

  return file;
}

async function saveAudioFileUploadToDatabase(name: string) {
  const fileUpload = await db.audioFileUpload.create({
    data: {
      status: 'Processing…',
      name,
    },
    include: { audioFile: true },
  });

  return fileUpload;
}

async function processAudioFileUpload(fileUpload: AudioFileUpload) {
  try {
    const fileName = `upload/${fileUpload.name}`;

    const stats = await ffprobe(fileName);
    console.log(`ffprobe stats for ${fileName}:`, stats);

    await updateAudioFileUploadDuration(fileUpload.id, stats.format.duration);

    const needsConverting = checkNeedsConverting(stats);
    const newFileName = `upload/${fileUpload.id}.mp3`;
    if (needsConverting) {
      const streamIndex = getAudioStreamIndex(stats);
      await ffmpeg(fileName, streamIndex, newFileName, (progress) => {
        let convertProgress: number;
        if (progress.progress === 'end') {
          convertProgress = 1;
        } else {
          const total = stats.format.duration;
          const currentTime = progress.out_time_us * MICROSECONDS;
          convertProgress = currentTime / total;
        }
        void updateAudioFileUploadConvertProgress(
          fileUpload.id,
          convertProgress,
        );
      });
    } else {
      await rename(fileName, newFileName);
    }

    await updateAudioFileUploadFinishing(fileUpload.id);
    const blobName = `audio/${fileUpload.id}.mp3`;
    await uploadFileToAzure({
      blobName,
      fileName: newFileName,
      contentType: 'audio/mpeg',
    });
    const audioUrl = getBlobUrl(blobName);

    await db.audioFileUpload.update({
      where: { id: fileUpload.id },
      data: { audioUrl },
    });

    await unlink(newFileName);

    await updateAudioFileDoneProcessing(fileUpload.id, newFileName);
  } catch (error) {
    await handleError(error, fileUpload.id);
  }
}

async function updateAudioFileUploadDuration(
  fileUploadId: AudioFileUpload['id'],
  duration: number,
) {
  const fileUpload = await db.audioFileUpload.update({
    where: { id: fileUploadId },
    data: { duration },
    include: { audioFile: true },
  });

  emitAudioFileProcessingEvent(fileUpload);
}

async function updateAudioFileUploadConvertProgress(
  fileUploadId: AudioFileUpload['id'],
  convertProgress: number,
) {
  const fileUpload = await db.audioFileUpload.update({
    where: { id: fileUploadId },
    data: {
      status: 'Converting…',
      convertProgress,
    },
    include: { audioFile: true },
  });

  emitAudioFileProcessingEvent(fileUpload);
}

async function updateAudioFileUploadFinishing(
  fileUploadId: AudioFileUpload['id'],
) {
  const fileUpload = await db.audioFileUpload.update({
    where: { id: fileUploadId },
    data: {
      status: 'Finishing up…',
      convertProgress: null,
    },
    include: { audioFile: true },
  });

  emitAudioFileProcessingEvent(fileUpload);
}

async function updateAudioFileDoneProcessing(
  fileUploadId: AudioFileUpload['id'],
  newName: string,
) {
  const fileUpload = await db.audioFileUpload.findUnique({
    where: { id: fileUploadId },
  });

  if (!fileUpload?.duration || !fileUpload.audioUrl) {
    throw serverError();
  }

  const newFileUpload = await db.audioFileUpload.update({
    where: { id: fileUploadId },
    data: {
      status: 'Done',
      audioFile: {
        create: {
          name: newName,
          audioUrl: fileUpload.audioUrl,
          duration: fileUpload.duration,
        },
      },
    },
    include: { audioFile: true },
  });

  emitAudioFileProcessingEvent(newFileUpload);
}

async function handleError(
  error: unknown,
  fileUploadId: AudioFileUpload['id'],
) {
  const errorMessage = error instanceof Error ? error.message : String(error);

  console.error('Error while converting file', error);

  const fileUpload = await db.audioFileUpload.update({
    where: { id: fileUploadId },
    data: {
      status: 'Error',
      errorMessage,
    },
    include: { audioFile: true },
  });

  emitAudioFileProcessingEvent(fileUpload);
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
    stats.streams[0].codec_name === 'mp3' &&
    stats.streams[0].bit_rate &&
    stats.streams[0].bit_rate < MAX_BIT_RATE
  );
}
