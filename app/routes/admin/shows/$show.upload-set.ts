import { rename } from 'node:fs';
import { promisify } from 'node:util';

import type { FileUpload } from '@prisma/client';
import type { ActionFunction } from '@remix-run/node';
import {
  unstable_createFileUploadHandler,
  unstable_parseMultipartFormData,
} from '@remix-run/node';

import { db } from '~/db/db.server';
import { ffmpeg } from '~/ffmpeg/ffmpeg.server';
import type { FFprobeOutput } from '~/ffmpeg/ffprobe.server';
import { ffprobe } from '~/ffmpeg/ffprobe.server';
import { UPLOAD_SET_FORM_KEY } from '~/types/admin/upload-set';

import { emitFileProcessingEvent } from './file-processing-sse';

const GIGABYTE = 1_000_000_000;
const MICROSECONDS = 1 / 1_000_000;

const badRequest = () => new Response('Bad Request', { status: 400 });
const notFound = () => new Response('Not Found', { status: 404 });
const serverError = () =>
  new Response('Internal Server Error', { status: 500 });

export const action: ActionFunction = async ({ params, request }) => {
  const id = params.show as string;
  const show = await db.show.findUnique({ where: { id } });
  if (!show) throw notFound();

  const fileInfo = await getFileFromFormData(request);

  const fileUpload = await saveFileUploadToDatabase(fileInfo.name);
  emitFileProcessingEvent({ type: 'new FileUpload', fileUpload });

  try {
    const filename = `upload/${fileUpload.filename}`;

    const stats = await ffprobe(filename);
    console.log(`ffprobe stats for ${filename}:`, stats);

    await updateFileUploadDuration(fileUpload.id, stats.format.duration);

    const needsConverting = checkNeedsConverting(stats);
    const newFilename = `upload/${fileUpload.id}.mp3`;
    if (needsConverting) {
      const streamIndex = getAudioStreamIndex(stats);
      await ffmpeg(filename, streamIndex, newFilename, (progress) => {
        let convertProgress: number;
        if (progress.progress === 'end') {
          convertProgress = 1;
        } else {
          const total = stats.format.duration;
          const currentTime = progress.out_time_us * MICROSECONDS;
          convertProgress = currentTime / total;
        }
        void updateFileUploadConvertProgress(fileUpload.id, convertProgress);
      });
    } else {
      await renameFile(filename, newFilename);
    }

    // TODO:
    // - Upload to Azure
    await db.fileUpload.update({
      where: { id: fileUpload.id },
      data: { audioUrl: 'https://example.com/audio.mp3' },
    });
    // - Clean up local files

    await updateFileDoneProcessing(fileUpload.id, newFilename);

    return null;
  } catch (error) {
    await handleError(error, fileUpload.id);
    throw error;
  }
};

async function getFileFromFormData(request: Request): Promise<globalThis.File> {
  const uploadHandler = unstable_createFileUploadHandler({
    directory: 'upload',
    maxPartSize: 1 * GIGABYTE,
  });

  const form = await unstable_parseMultipartFormData(request, uploadHandler);

  const file = form.get(UPLOAD_SET_FORM_KEY);
  if (typeof file === 'string' || file === null) throw badRequest();

  return file;
}

async function saveFileUploadToDatabase(filename: string) {
  const fileUpload = await db.fileUpload.create({
    data: {
      status: 'Processing…',
      filename,
    },
  });

  return fileUpload;
}

async function updateFileUploadDuration(
  fileUploadId: FileUpload['id'],
  duration: number
) {
  const data: Partial<FileUpload> = { duration };

  const fileUpload = await db.fileUpload.update({
    where: { id: fileUploadId },
    data,
  });

  emitFileProcessingEvent({ type: 'FileUpload update', fileUpload });
}

async function updateFileUploadConvertProgress(
  fileUploadId: FileUpload['id'],
  convertProgress: number
) {
  const data: Partial<FileUpload> = { status: 'Converting…', convertProgress };

  const fileUpload = await db.fileUpload.update({
    where: { id: fileUploadId },
    data,
  });

  emitFileProcessingEvent({ type: 'FileUpload update', fileUpload });
}

async function updateFileDoneProcessing(
  fileUploadId: FileUpload['id'],
  newFilename: string
) {
  const fileUpload = await db.fileUpload.findUnique({
    where: { id: fileUploadId },
  });

  if (!fileUpload || !fileUpload.duration || !fileUpload.audioUrl) {
    throw serverError();
  }

  const file = await db.file.create({
    data: {
      id: fileUpload.id,
      filename: newFilename,
      audioUrl: fileUpload.audioUrl,
      duration: fileUpload.duration,
    },
  });

  await db.fileUpload.delete({
    where: { id: fileUploadId },
  });

  emitFileProcessingEvent({ type: 'new File', file });
}

async function handleError(error: unknown, fileUploadId: FileUpload['id']) {
  const errorMessage = error instanceof Error ? error.message : String(error);

  console.error('Error while converting file', error);

  const data: Partial<FileUpload> = { status: 'Error', errorMessage };

  const fileUpload = await db.fileUpload.update({
    where: { id: fileUploadId },
    data,
  });

  emitFileProcessingEvent({ type: 'FileUpload update', fileUpload });
}

/**
 * Checks if the file has at least 1 audio stream. If so, returns the index of
 * the audio stream. Otherwise, throws an error.
 */
function getAudioStreamIndex(stats: FFprobeOutput) {
  const streamIndex = stats.streams.findIndex(
    (stream) => stream.codec_type === 'audio'
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

const renameFile = promisify(rename);
