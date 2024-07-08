import { withZod } from '@remix-validated-form/with-zod';
import { Temporal } from 'temporal-polyfill';
import { z } from 'zod';
import { zfd } from 'zod-form-data';

export const setSchema = z.object({
  id: zfd.text(z.string().optional()),
  artist: zfd.text(z.string().optional()),
  offset: zfd.numeric(z.number().optional()),
  audioFileId: zfd.text(z.string().optional()),
});

const COLOR_REGEX = /^#[\da-f]{6}$/iu;

function isValidTimeZone(timeZone: string): boolean {
  try {
    Temporal.TimeZone.from(timeZone);
    return true;
  } catch {
    return false;
  }
}

export const schema = zfd.formData({
  name: zfd.text(),
  slug: zfd.text(
    z.string().refine((id) => id !== 'admin', {
      message: 'Invalid show URL',
    }),
  ),
  startDate: zfd.text(z.string().datetime({ local: true }).optional()),
  timeZone: zfd.text(
    z.string().refine(isValidTimeZone, { message: 'Invalid time zone' }),
  ),
  backgroundColor: zfd.text(z.string().regex(COLOR_REGEX).optional()),
  backgroundColorSecondary: zfd.text(z.string().regex(COLOR_REGEX).optional()),
  description: zfd.text(z.string().optional()),
  logoImageFileId: zfd.text(z.string().optional()),
  backgroundImageFileId: zfd.text(z.string().optional()),
  sets: zfd.repeatableOfType(setSchema),
});

export const clientValidator = withZod(schema);
