import { TRPCError } from '@trpc/server';

import { db } from '../../db.ts';

export async function getAudioFile(id: string) {
  const audioFile = await db.audioFile.findUnique({
    where: { id },
  });
  if (!audioFile) throw new TRPCError({ code: 'NOT_FOUND' });

  return audioFile;
}
