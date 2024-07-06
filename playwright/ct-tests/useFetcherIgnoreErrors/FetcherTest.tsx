/* eslint-disable @typescript-eslint/no-confusing-void-expression */

import { useCallback, useState } from 'react';

import { useFetcherIgnoreErrors } from '~/hooks/useFetcherIgnoreErrors';

export function FetcherTest() {
  const [naiveData, setNaiveData] = useState<unknown>();

  const fetcher = useFetcherIgnoreErrors();

  const doFetch = useCallback(
    (url: string) => {
      fetcher.load(url);
      fetch(url)
        .then((res) => res.json())
        .then(setNaiveData)
        .catch(() => {
          setNaiveData('error');
        });
    },
    [fetcher],
  );

  return (
    <div>
      <button onClick={() => doFetch('/a')}>Fetch A</button>
      <button onClick={() => doFetch('/b')}>Fetch B</button>
      <button onClick={() => doFetch('/c')}>Fetch C</button>
      <div>Naive data: {stringify(naiveData)}</div>
      <div>Fetcher data: {stringify(fetcher.data)}</div>
    </div>
  );
}

function stringify(data: unknown): string {
  if (data === undefined) {
    return 'undefined';
  }
  if (typeof data === 'string') {
    return data;
  }
  return JSON.stringify(data);
}
