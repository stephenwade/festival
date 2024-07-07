type DeepNonNullable<T> = T extends (infer U)[]
  ? DeepNonNullable<U>[]
  : T extends Record<string, unknown>
    ? { [P in keyof T]: DeepNonNullable<T[P]> }
    : NonNullable<T>;

/**
 * Ensure that all of an object's properties are not null.
 */
// @ts-expect-error TypeScript doesn't like the predicate
export function validate<T>(obj: T): obj is DeepNonNullable<T> {
  if (obj === null) return false;
  if (typeof obj !== 'object') return true;
  for (const key in obj) {
    if (obj[key] === null) return false;
  }
  return true;
}
