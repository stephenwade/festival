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
  name: zfd.text(),
  id: zfd.text(
    z.string().refine((id) => id !== 'new', {
      message: 'Invalid show URL',
    }),
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
