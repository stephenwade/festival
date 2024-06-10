import { withZod } from '@remix-validated-form/with-zod';

import { db } from '~/db.server/db';

import { schema } from './validator';

export function makeServerValidator({
  previousId,
}: { previousId?: string } = {}) {
  return withZod(
    schema.refine(
      async ({ id }) => {
        if (id === previousId) return true;
        const existingShow = await db.show.findUnique({ where: { id } });
        return !existingShow;
      },
      {
        path: ['id'],
        message: 'A show already exists with that URL.',
      },
    ),
  );
}
