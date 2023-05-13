import type { File, Set } from '@prisma/client';
import { Prisma } from '@prisma/client';

export const FileProcessingEventNames = [
  'new set',
  'set update',
  'file update',
] as const;

export type FileProcessingEventName = (typeof FileProcessingEventNames)[number];

const setWithFiles = Prisma.validator<Prisma.SetArgs>()({
  include: { file: true },
});

type SetWithFiles = Prisma.SetGetPayload<typeof setWithFiles>;

export type FileProcessingNewSetData = SetWithFiles;

export type FileProcessingSetUpdateData = { id: Set['id'] } & Partial<Set>;

export type FileProcessingFileUpdateData = { id: File['id'] } & Partial<File>;
