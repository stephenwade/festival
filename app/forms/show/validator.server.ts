import { withZod } from '@remix-validated-form/with-zod';

import { db } from '~/db.server/db';

import { schema } from './validator';

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
