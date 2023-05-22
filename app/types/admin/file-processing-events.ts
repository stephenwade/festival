import type { File, Prisma, Set } from '@prisma/client';

export const FileProcessingEventNames = [
  'new set',
  'set update',
  'file update',
] as const;

export type FileProcessingEventName = (typeof FileProcessingEventNames)[number];

const setWithFiles = {
  include: { file: true },
  orderBy: { offset: 'asc' },
} satisfies Prisma.SetFindManyArgs;

type SetWithFiles = Prisma.SetGetPayload<typeof setWithFiles>;

export type FileProcessingNewSetData = SetWithFiles;

export type FileProcessingSetUpdateData = { id: Set['id'] } & Partial<Set>;

export type FileProcessingFileUpdateData = { id: File['id'] } & Partial<File>;
