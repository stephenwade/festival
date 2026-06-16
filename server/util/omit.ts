export function omit<T extends object, TKey extends keyof T>(
  item: T,
  keys: TKey[],
): Omit<T, TKey> {
  const result = { ...item };
  for (const key of keys) {
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete -- This is safe because `result` was (shallow) copied from `item`
    delete result[key];
  }
  return result;
}
