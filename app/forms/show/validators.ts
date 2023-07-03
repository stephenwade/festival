import { withZod } from '@remix-validated-form/with-zod';
import { z } from 'zod';
import { zfd } from 'zod-form-data';

import { db } from '~/db/db.server';

export const setSchema = z.object({
  id: zfd.text(),
  artist: zfd.text(),
  offset: zfd.numeric(),
  audioFileUploadId: zfd.text(z.string().optional()),
});

const COLOR_REGEX = /^#[\da-f]{6}$/iu;

export const schema = zfd.formData({
  name: zfd.text(),
  id: zfd.text(
    z.string().refine((id) => id !== 'new', {
      message: 'Invalid show URL',
    })
  ),
  startDate: z.string().datetime(),
  description: zfd.text(),
  showLogoFileId: zfd.text(),
  backgroundImageFileId: zfd.text(),
  backgroundColor: zfd.text(z.string().regex(COLOR_REGEX)),
  backgroundColorSecondary: zfd.text(z.string().regex(COLOR_REGEX)),
  sets: zfd.repeatableOfType(setSchema),
});

export const clientValidator = withZod(schema);

export const makeServerValidator = ({
  previousId,
}: { previousId?: string } = {}) =>
  withZod(
    schema.refine(
      async ({ id }) => {
        if (id === previousId) return true;
        const existingShow = await db.show.findUnique({ where: { id } });
        return !existingShow;
      },
      {
        path: ['id'],
        message: 'A show already exists with that URL.',
      }
    )
  );
