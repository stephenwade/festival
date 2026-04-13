import type { Prisma } from '@prisma/client';

export const showIncludeData = {
  logoImageFile: true,
  backgroundImageFile: true,
  sets: {
    include: { audioFile: true },
    orderBy: { offset: 'asc' },
  },
} satisfies Prisma.ShowInclude;

export type ShowWithData = Prisma.ShowGetPayload<{
  include: typeof showIncludeData;
}>;
