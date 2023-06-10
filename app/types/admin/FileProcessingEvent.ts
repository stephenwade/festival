import type { File, NewFile } from '@prisma/client';
import type { SerializeFrom } from '@remix-run/node';

export type FileProcessingEventData =
  | { type: 'new NewFile'; newFile: SerializeFrom<NewFile> }
  | { type: 'NewFile update'; newFile: SerializeFrom<NewFile> }
  | { type: 'new File'; file: SerializeFrom<File> };
