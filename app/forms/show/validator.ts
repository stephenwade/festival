import { withZod } from '@remix-validated-form/with-zod';
import { z } from 'zod';
import { zfd } from 'zod-form-data';

export const setSchema = z.object({
  id: zfd.text(),
  artist: zfd.text(z.string().optional()),
  offset: zfd.numeric(z.number().optional()),
  audioFileId: zfd.text(z.string().optional()),
});

const COLOR_REGEX = /^#[\da-f]{6}$/iu;

export const schema = zfd.formData({
  id: zfd.text(),
  name: zfd.text(),
  slug: zfd.text(
    z.string().refine((id) => id !== 'admin', {
      message: 'Invalid show URL',
    }),
  ),
  startDate: z.string().datetime().optional(),
  timeZone: zfd.text(z.string().optional()), // TODO: add field, validate timezone
  backgroundColor: zfd.text(z.string().regex(COLOR_REGEX).optional()),
  backgroundColorSecondary: zfd.text(z.string().regex(COLOR_REGEX).optional()),
  description: zfd.text(z.string().optional()),
  logoImageFileId: zfd.text(z.string().optional()),
  backgroundImageFileId: zfd.text(z.string().optional()),
  sets: zfd.repeatableOfType(setSchema),
});

export const clientValidator = withZod(schema);
