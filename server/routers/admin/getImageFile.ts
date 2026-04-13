import { TRPCError } from '@trpc/server';

import { db } from '../../db.ts';

export async function getImageFile(id: string) {
  const imageFile = await db.imageFile.findUnique({
    where: { id },
  });
  if (!imageFile) throw new TRPCError({ code: 'NOT_FOUND' });

  return imageFile;
}
