export function omit<T extends object, TKey extends keyof T>(
  item: T,
  keys: TKey[],
): Omit<T, TKey> {
  const result = { ...item };
  for (const key of keys) {
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete result[key];
  }
  return result;
}
