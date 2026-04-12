import { withZod } from '@rvf/zod';

import { db } from '../../app/db.server/db.ts';
import { schema } from './show.ts';

export function makeServerValidator({
  previousSlug,
}: { previousSlug?: string } = {}) {
  return withZod(
    schema.refine(
      async ({ slug }) => {
        if (slug === previousSlug) return true;
        const existingShow = await db.show.findUnique({ where: { slug } });
        return !existingShow;
      },
      {
        path: ['slug'],
        message: 'A show already exists with that URL.',
      },
    ),
  );
}
