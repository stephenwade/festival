import { useFetcher } from '@remix-run/react';
import { addMilliseconds, addSeconds, isBefore, parseISO } from 'date-fns';
import { useCallback, useEffect, useMemo, useState } from 'react';

import type { ShowData } from '~/types/ShowData';
import type { TargetShowInfo, TargetTimeInfo } from '~/types/ShowInfo';

import { useClock } from './useClock';
import { useCurrentShowId } from './useCurrentShowId';

type UseShowStatusProps = {
  loaderData: ShowData;
};

export function useShowInfo({ loaderData }: UseShowStatusProps) {
  const [audioDurations, setAudioDurations] = useState<{
    [audioUrl: string]: number;
  }>({});

  const onLoadedMetadata = useCallback(
    ({ id, duration }: { id: string; duration: number }) => {
      setAudioDurations((audioLengths) => ({
        ...audioLengths,
        [id]: duration,
      }));
    },
    []
  );

  const showId = useCurrentShowId();

  const fetcher = useFetcher<ShowData>();
  const reloadShow = useCallback(() => {
    fetcher.load(`/${showId}/info`);

    // Including `fetcher` gets the page into an infinite loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showId]);

  useEffect(() => {
    const handles = [
      setTimeout(reloadShow, 0),
      setInterval(reloadShow, 1000 * 60),
    ];

    return () => {
      for (const handle of handles) {
        clearTimeout(handle);
      }
    };
  }, [reloadShow, showId]);

  const data = fetcher.data || loaderData;
  const clientTimeSkewMs = useMemo(() => {
    const serverDate = parseISO(data.serverDate);

    return Date.now() - serverDate.valueOf();
  }, [data.serverDate]);

  const sets = useMemo(() => {
    return data.sets
      .map(function parseDates(set) {
        const start = parseISO(set.start);

        const length = audioDurations[set.id] ?? set.duration;
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
  }, [audioDurations, clientTimeSkewMs, data.sets]);

  const currentSetIndex = sets.findIndex((set) =>
    isBefore(Date.now(), set.end)
  );
  const currentSet = currentSetIndex === -1 ? undefined : sets[currentSetIndex];
  const nextSet =
    currentSetIndex === -1 ? undefined : sets[currentSetIndex + 1];

  const timeInfo: TargetTimeInfo = currentSet
    ? isBefore(Date.now(), currentSet.start)
      ? {
          status: 'WAITING_UNTIL_START',
          secondsUntilSet: Math.ceil(
            (currentSet.start.valueOf() - Date.now()) / 1000
          ),
        }
      : {
          status: 'PLAYING',
          currentTime: Math.floor(
            (Date.now() - currentSet.start.valueOf()) / 1000
          ),
        }
    : { status: 'ENDED' };

  useClock(timeInfo.status !== 'ENDED');

  const targetShowInfo: TargetShowInfo = { ...timeInfo, currentSet, nextSet };

  return { targetShowInfo, onLoadedMetadata };
}
