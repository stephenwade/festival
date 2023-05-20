import { rename } from 'node:fs';
import { promisify } from 'node:util';

import type { File, Set, Show } from '@prisma/client';
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

import {
  emitFileUpdate,
  emitNewSet,
  emitSetUpdate,
} from './file-processing-sse';

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

  const set = await saveSetAndFileToDatabase(show.id, fileInfo.name);
  const file = set.file;
  if (!file) throw serverError();
  emitNewSet({ ...set, file });

  if (!file.filename) throw serverError();
  try {
    const filename = `upload/${file.filename}`;

    const stats = await ffprobe(filename);
    console.log(`ffprobe stats for ${filename}:`, stats);

    await updateSetDuration(set.id, stats.format.duration);

    const needsConverting = checkNeedsConverting(stats);
    const newFilename = `upload/${file.id}.mp3`;
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
        void updateFileConvertProgress(file.id, convertProgress);
      });
    } else {
      await renameFile(filename, newFilename);
    }

    // TODO:
    // - Upload to Azure
    // - Clean up local files

    await updateFileDoneProcessing(file.id, newFilename);

    return null;
  } catch (error) {
    await handleError(error, file.id);
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

async function saveSetAndFileToDatabase(showId: Show['id'], filename: string) {
  const set = await db.set.create({
    data: {
      isValid: false,
      file: {
        create: {
          isReady: false,
          status: 'Processing…',
          filename,
        },
      },
      showId,
    },
    include: { file: true },
  });

  return set;
}

async function updateSetDuration(setId: Set['id'], duration: number) {
  const data: Partial<Set> = { duration };

  await db.set.update({
    where: { id: setId },
    data,
  });

  emitSetUpdate({ id: setId, ...data });
}

async function updateFileConvertProgress(
  fileId: File['id'],
  convertProgress: number
) {
  const data: Partial<File> = { status: 'Converting…', convertProgress };

  await db.file.update({
    where: { id: fileId },
    data,
  });

  emitFileUpdate({ id: fileId, ...data });
}

async function updateFileDoneProcessing(
  fileId: File['id'],
  newFilename: string
) {
  const data: Partial<File> = {
    status: 'Done',
    filename: newFilename,
  };

  await db.file.update({
    where: { id: fileId },
    data,
  });

  emitFileUpdate({ id: fileId, ...data });
}

async function handleError(error: unknown, fileId: File['id']) {
  const errorMessage = error instanceof Error ? error.message : String(error);

  console.error('Error while converting file', error);

  const data: Partial<File> = { status: 'Error', errorMessage };

  await db.file.update({
    where: { id: fileId },
    data,
  });

  emitFileUpdate({ id: fileId, ...data });
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
