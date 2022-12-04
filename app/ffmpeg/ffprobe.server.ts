import { spawn } from 'node:child_process';

import { z } from 'zod';

const numericString = z
  .string()
  .regex(/^\d+(?:\.\d+)?$/u)
  .transform(Number);

/**
 * Parses a string containing JSON output from `ffprobe`.
 */
const ffprobeOutputSchema = z.preprocess(
  (str) => JSON.parse(z.string().parse(str)),
  z.object({
    streams: z.array(
      z.object({
        index: z.number().int(),
        codec_name: z.string().min(1),
        codec_type: z.string().min(1),
        duration: numericString,
        bit_rate: numericString.optional(),
      })
    ),
    format: z.object({
      filename: z.string().min(1),
      format_name: z.string().min(1),
      duration: numericString,
      bit_rate: numericString,
    }),
  })
);

export type FFprobeOutput = z.infer<typeof ffprobeOutputSchema>;

export function ffprobe(filename: string) {
  console.log(`Running ffprobe on ${filename}`);

  const ffprobe = spawn('ffprobe', [
    '-loglevel',
    'warning',
    '-print_format',
    'json',
    '-show_format',
    '-show_streams',
    filename,
  ]);

  let output = '';

  ffprobe.stdout.on('data', (data: Buffer) => {
    output += data.toString();
  });

  ffprobe.stderr.on('data', (data: Buffer) => {
    console.warn(`stderr when running ffprobe on ${filename}:`);
    console.warn(data.toString());
  });

  return new Promise<FFprobeOutput>((resolve, reject) => {
    ffprobe.on('close', (code) => {
      if (code === 0) {
        try {
          resolve(ffprobeOutputSchema.parse(output));
        } catch (error) {
          reject(error);
        }
      } else {
        reject(new Error(`ffprobe exited with error code ${String(code)}`));
      }
    });
  });
}
