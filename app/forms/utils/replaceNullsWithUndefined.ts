// Adapted from https://stackoverflow.com/a/72549576

type RecursivelyReplaceNullWithUndefined<T> = T extends null
  ? undefined
  : T extends (infer U)[]
  ? RecursivelyReplaceNullWithUndefined<U>[]
  : T extends Record<string, unknown>
  ? { [K in keyof T]: RecursivelyReplaceNullWithUndefined<T[K]> }
  : T;

/**
 * Recursively replaces all `null`s with `undefined`.
 */
export function replaceNullsWithUndefined<T>(
  obj: T,
): RecursivelyReplaceNullWithUndefined<T> {
  if (obj === null || obj === undefined) {
    return undefined as RecursivelyReplaceNullWithUndefined<T>;
  }

  const newObj = structuredClone(obj);

  if (obj.constructor.name === 'Object' || Array.isArray(obj)) {
    for (const key in obj) {
      // @ts-expect-error I know what I'm doing
      newObj[key] = replaceNullsWithUndefined(obj[key]);
    }
  }
  return newObj as RecursivelyReplaceNullWithUndefined<T>;
}
