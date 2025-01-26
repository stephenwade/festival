import { createWriteStream } from 'node:fs';
import { mkdir, unlink } from 'node:fs/promises';
import path from 'node:path';
import { Writable } from 'node:stream';

import type { AudioFile } from '@prisma/client';
import type { ActionFunction } from '@remix-run/node';

import { requireLogin } from '~/auth/redirect-to-login.server';
import { uploadFileToAzure } from '~/azure/blob-client.server';
import { db } from '~/db.server/db';
import { ffmpeg } from '~/ffmpeg.server/ffmpeg';
import type { FFprobeOutput } from '~/ffmpeg.server/ffprobe';
import { ffprobe } from '~/ffmpeg.server/ffprobe';
import { emitAudioFileProcessingEvent } from '~/sse.server/audio-file-events';
import { notFound, serverError } from '~/utils/responses.server';

const MICROSECONDS = 1 / 1_000_000;

export const action = (async (args) => {
  await requireLogin(args);

  const id = args.params.id!;

  const file = await db.audioFile.findUnique({
    where: { id },
  });
  if (!file) throw notFound();

  // Run this in the background after responding to the request
  void checkAudioFile(file);
}) satisfies ActionFunction;

async function checkAudioFile(file: AudioFile) {
  try {
    console.log('Checking audio file', file.id);

    const fileName = await downloadFile(file.url);

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

      await updateAudioFileUploading(file.id);
      const blobName = `audio/${file.id}.mp3`;
      await uploadFileToAzure({
        blobName,
        fileName: newFileName,
        contentType: 'audio/mpeg',
      });

      await unlink(newFileName);
    } else {
      console.log('Audio file does not need converting:', fileName);
    }

    await unlink(fileName);

    await updateAudioFileDoneProcessing(file.id);
  } catch (error) {
    await handleError(error, file.id);
  }
}

async function downloadFile(url: string) {
  await mkdir('upload', {
    // Don't error if the directory already exists
    recursive: true,
  });

  const extname = path.extname(url);
  const filePath = `upload/${crypto.randomUUID()}${extname}`;

  const response = await fetch(url);
  if (!response.ok || !response.body) {
    throw new Error(`Failed to download file: ${response.statusText}`);
  }

  const fileStream = Writable.toWeb(createWriteStream(filePath));
  await response.body.pipeTo(fileStream);

  return filePath;
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
      conversionStatus: 'RE_UPLOAD',
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
