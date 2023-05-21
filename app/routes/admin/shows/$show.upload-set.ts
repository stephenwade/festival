import { rename } from 'node:fs';
import { promisify } from 'node:util';

import type { NewFile } from '@prisma/client';
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

  const newFile = await saveNewFileToDatabase(fileInfo.name);
  // emitNewNewFile(fileProcessing);

  try {
    const filename = `upload/${newFile.filename}`;

    const stats = await ffprobe(filename);
    console.log(`ffprobe stats for ${filename}:`, stats);

    await updateNewFileDuration(newFile.id, stats.format.duration);

    const needsConverting = checkNeedsConverting(stats);
    const newFilename = `upload/${newFile.id}.mp3`;
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
        void updateNewFileConvertProgress(newFile.id, convertProgress);
      });
    } else {
      await renameFile(filename, newFilename);
    }

    // TODO:
    // - Upload to Azure
    await db.newFile.update({
      where: { id: newFile.id },
      data: { audioUrl: 'https://example.com/audio.mp3' },
    });
    // - Clean up local files

    await updateFileDoneProcessing(newFile.id, newFilename);

    return null;
  } catch (error) {
    await handleError(error, newFile.id);
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

async function saveNewFileToDatabase(filename: string) {
  const newFile = await db.newFile.create({
    data: {
      status: 'Processing…',
      filename,
    },
  });

  return newFile;
}

async function updateNewFileDuration(
  newFileId: NewFile['id'],
  duration: number
) {
  const data: Partial<NewFile> = { duration };

  await db.newFile.update({
    where: { id: newFileId },
    data,
  });

  // emitNewFileUpdate({ id: newFileId, ...data });
}

async function updateNewFileConvertProgress(
  newFileId: NewFile['id'],
  convertProgress: number
) {
  const data: Partial<NewFile> = { status: 'Converting…', convertProgress };

  await db.newFile.update({
    where: { id: newFileId },
    data,
  });

  // emitNewFileUpdate({ id: newFileId, ...data });
}

async function updateFileDoneProcessing(
  newFileId: NewFile['id'],
  newFilename: string
) {
  const newFile = await db.newFile.findUnique({
    where: { id: newFileId },
  });

  if (!newFile || !newFile.duration || !newFile.audioUrl) {
    throw serverError();
  }

  /* const file = */ await db.file.create({
    data: {
      id: newFile.id,
      filename: newFilename,
      audioUrl: newFile.audioUrl,
      duration: newFile.duration,
    },
  });

  await db.newFile.delete({
    where: { id: newFileId },
  });

  // emitNewFile(file);
}

async function handleError(error: unknown, newFileId: NewFile['id']) {
  const errorMessage = error instanceof Error ? error.message : String(error);

  console.error('Error while converting file', error);

  const data: Partial<NewFile> = { status: 'Error', errorMessage };

  await db.newFile.update({
    where: { id: newFileId },
    data,
  });

  // emitNewFileUpdate({ id: newFileId, ...data });
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
