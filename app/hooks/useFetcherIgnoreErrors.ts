import type { useLoaderData } from '@remix-run/react';
import { useCallback, useMemo, useState } from 'react';

type SerializeFrom<T> = ReturnType<typeof useLoaderData<T>>;

/**
 * A custom fetcher that quietly ignores errors.
 */
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export function useFetcherIgnoreErrors<TData>() {
  const [data, setData] = useState<SerializeFrom<TData> | undefined>(undefined);
  const [state, setState] = useState<'idle' | 'loading'>('idle');

  const load = useCallback((url: string) => {
    setState('loading');

    fetch(url)
      .then((response) => response.json() as Promise<SerializeFrom<TData>>)
      .then(setData)
      .catch(() => {
        // Ignore errors
      })
      .finally(() => {
        setState('idle');
      });
  }, []);

  const result = useMemo(() => ({ data, state, load }), [data, state, load]);

  return result;
}
