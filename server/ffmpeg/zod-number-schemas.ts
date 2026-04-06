import { z } from 'zod';

export const integerString = z
  .string()
  .regex(/^[0-9]+$/)
  .transform(Number);

export const numericString = z
  .string()
  .regex(/^[0-9]+(?:\.[0-9]+)?$/)
  .transform(Number);
