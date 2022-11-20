import { withZod } from '@remix-validated-form/with-zod';
import { z } from 'zod';
import { zfd } from 'zod-form-data';

import { db } from '~/db/db.server';

export const schema = zfd.formData({
  name: zfd.text(),
  id: zfd.text(
    z.string().refine((id) => id !== 'new', {
      message: 'Invalid show URL',
    })
  ),
  description: zfd.text(),
});

export const clientValidator = withZod(schema);

export const makeServerValidator = ({
  previousId,
}: { previousId?: string } = {}) =>
  withZod(
    schema.refine(
      async ({ id }) => {
        if (id === previousId) return true;
        const existingShow = await db.show.findFirst({ where: { id } });
        return !existingShow;
      },
      {
        path: ['id'],
        message: 'A show already exists with that URL.',
      }
    )
  );
