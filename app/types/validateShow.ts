import type { ShowWithData } from './ShowWithData';

type DeepNonNullable<T> = T extends (infer U)[]
  ? DeepNonNullable<U>[]
  : T extends Record<string, unknown>
    ? { [P in keyof T]: DeepNonNullable<T[P]> }
    : NonNullable<T>;

/**
 * Ensure that all of an object's properties are not null.
 */
function validate(obj: Record<string, unknown> | null): boolean {
  if (obj === null) return false;
  if (typeof obj !== 'object') return true;
  for (const key in obj) {
    if (obj[key] === null) return false;
  }
  return true;
}

export function validateShow(
  show: ShowWithData,
): show is DeepNonNullable<ShowWithData> {
  return validate(show) && show.sets.length > 0;
}
