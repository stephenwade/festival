import { useFetcher } from '@remix-run/react';
import { addMilliseconds, addSeconds, parseISO } from 'date-fns';
import { useCallback, useEffect, useMemo, useState } from 'react';

import type { ShowData, ShowStatus } from '~/types/ShowData';

import { useCurrentShowId } from './useCurrentShowId';

type UseShowStatusProps = {
  loaderData: ShowData;
};

export function useShowStatus({ loaderData }: UseShowStatusProps): ShowStatus {
  const [audioDurations, setAudioLengths] = useState<{
    [audioUrl: string]: number;
  }>({});

  const onLoadedMetadata: ShowStatus['onLoadedMetadata'] = useCallback(
    ({ audioUrl, duration }) => {
      setAudioLengths((audioLengths) => ({
        ...audioLengths,
        [audioUrl]: duration,
      }));
    },
    []
  );

  const showId = useCurrentShowId();

  const fetcher = useFetcher<ShowData>();
  const reloadShow = useCallback(() => {
    fetcher.load(`/${showId}/info`);
  }, [fetcher, showId]);

  useEffect(() => {
    const handle = setTimeout(reloadShow, 1000 * 60);
    return () => {
      clearTimeout(handle);
    };
  }, [reloadShow]);

  const data = loaderData || fetcher.data;

  const sets = useMemo(() => {
    const serverDate = parseISO(data.serverDate);

    const clientTimeSkewMs = Date.now() - serverDate.valueOf();

    return data.sets
      .map(function parseDates(set) {
        const start = parseISO(set.start);

        const length = audioDurations[set.audioUrl] ?? set.duration;
        const end = addSeconds(start, length);

        return { ...set, start, end };
      })
      .map(function adjustForClientTimeSkew(set) {
        const start = addMilliseconds(set.start, clientTimeSkewMs);
        const end = addMilliseconds(set.end, clientTimeSkewMs);

        return { ...set, start, end };
      })
      .sort(function byDate(a, b) {
        return a.start.valueOf() - b.start.valueOf();
      });
  }, [audioDurations, data]);

  return { ...data, sets, onLoadedMetadata };
}
