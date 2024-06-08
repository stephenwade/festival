import type { SerializeFrom } from '@remix-run/node';
import { useCallback, useMemo, useState } from 'react';

/**
 * A custom fetcher that quietly ignores errors.
 */
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
