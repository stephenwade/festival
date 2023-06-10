import type { File, FileUpload } from '@prisma/client';
import type { SerializeFrom } from '@remix-run/node';

export type FileProcessingEventData =
  | { type: 'new FileUpload'; fileUpload: SerializeFrom<FileUpload> }
  | { type: 'FileUpload update'; fileUpload: SerializeFrom<FileUpload> }
  | { type: 'new File'; file: SerializeFrom<File> };
