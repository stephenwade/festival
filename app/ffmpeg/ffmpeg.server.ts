import { spawn } from 'node:child_process';

import { z } from 'zod';

const integerString = z.string().regex(/^\d+$/u).transform(Number);

/**
 * Parses a string containing progress output in `key=value` format from FFmpeg.
 *
 * @example
 * ```text
 * total_size=1888075
 * out_time_us=117943923
 * out_time=00:01:57.943923
 * speed=56.7x
 * progress=continue
 * ```
 */
const ffmpegProgressSchema = z.preprocess(
  (str) =>
    Object.fromEntries(
      z
        .string()
        .parse(str)
        .trim()
        .split('\n')
        .map((x) => x.split('='))
    ),
  z.object({
    total_size: integerString,
    out_time_us: integerString,
    out_time: z.string(),
    speed: z.string(),
    progress: z.string(),
  })
);

export type FFmpegProgress = z.infer<typeof ffmpegProgressSchema>;

export type FFmpegProgressCallback = (progress: FFmpegProgress) => void;

export function ffmpeg(
  inputFilename: string,
  streamIndex: number,
  outputFilename: string,
  progressCallback?: FFmpegProgressCallback
) {
  console.log('Running ffmpeg', { inputFilename, outputFilename });

  const ffmpeg = spawn('ffmpeg', [
    '-loglevel',
    'warning',
    '-i',
    inputFilename,
    '-map',
    `0:${streamIndex}`,
    outputFilename,
    '-progress',
    '-',
  ]);

  if (progressCallback) {
    ffmpeg.stdout.on('data', (data: Buffer) => {
      try {
        progressCallback(ffmpegProgressSchema.parse(data.toString()));
      } catch (error) {
        console.warn('Failed to parse stdout when running ffmpeg:', {
          inputFilename,
          outputFilename,
        });
        console.warn(error);
      }
    });
  }

  ffmpeg.stderr.on('data', (data: Buffer) => {
    console.warn('stderr when running ffmpeg:', {
      inputFilename,
      outputFilename,
    });
    console.warn(data.toString());
  });

  return new Promise<void>((resolve, reject) => {
    ffmpeg.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`ffmpeg exited with error code ${String(code)}`));
      }
    });
  });
}