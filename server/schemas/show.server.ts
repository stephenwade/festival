import { withStandardSchema } from '@rvf/core';

import { schema as showSchema } from '../../shared/schemas/show.ts';
import { db } from '../db.ts';

export function makeServerValidator({
  previousSlug,
}: { previousSlug?: string } = {}) {
  return withStandardSchema(
    showSchema.refine(
      async ({ slug }) => {
        if (slug === previousSlug) return true;
        const existingShow = await db.show.findUnique({ where: { slug } });
        return !existingShow;
      },
      {
        path: ['slug'],
        error: 'A show already exists with that URL.',
      },
    ),
  );
}
