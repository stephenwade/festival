// Adapted from https://stackoverflow.com/a/72549576

type RecursivelyReplaceUndefinedWithNull<T> = T extends undefined
  ? null
  : T extends (infer U)[]
  ? RecursivelyReplaceUndefinedWithNull<U>[]
  : T extends Record<string, unknown>
  ? { [K in keyof T]: RecursivelyReplaceUndefinedWithNull<T[K]> }
  : T;

/**
 * Recursively replaces all `undefined`s with `null`.
 */
export function replaceUndefinedsWithNull<T>(
  obj: T,
): RecursivelyReplaceUndefinedWithNull<T> {
  if (obj === undefined || obj === null) {
    return null as RecursivelyReplaceUndefinedWithNull<T>;
  }

  const newObj = structuredClone(obj);

  if (obj.constructor.name === 'Object' || Array.isArray(obj)) {
    for (const key in obj) {
      // @ts-expect-error I know what I'm doing
      newObj[key] = replaceUndefinedsWithNull(obj[key]);
    }
  }
  return newObj as RecursivelyReplaceUndefinedWithNull<T>;
}
