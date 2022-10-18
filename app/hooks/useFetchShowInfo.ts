import { useEffect, useState } from 'react';
import { useCounter } from 'usehooks-ts';

import type { ShowData } from '~/types/ShowData';

async function fetchShowInfo(showId: string) {
  const result = await fetch(`/${showId}/info`);
  return (await result.json()) as ShowData;
}

export function useFetchShowInfo(showId: string) {
  const [showInfo, setShowInfo] = useState<ShowData>();
  const { count, increment: refetch } = useCounter();

  useEffect(() => {
    void fetchShowInfo(showId).then(setShowInfo);
  }, [count, showId]);

  return { data: showInfo, refetch };
}
