import { addMilliseconds, addSeconds, isBefore, parseISO } from 'date-fns';
import { useCallback, useEffect, useMemo, useState } from 'react';

import type { loader as showDataLoader } from '~/routes/$show.[data.json]';
import type { ShowData } from '~/types/ShowData';
import type { TargetShowInfo, TargetTimeInfo } from '~/types/ShowInfo';

import { useClock } from './useClock';
import { useFetcherIgnoreErrors } from './useFetcherIgnoreErrors';

export type LoadedMetadataHandler = (args: {
  id: string;
  duration: number;
}) => void;

export function useShowInfo(
  loaderData: Pick<ShowData, 'id' | 'serverDate' | 'sets'>,
  { ci = false, enableClock = true } = {},
) {
  const [audioDurations, setAudioDurations] = useState<Record<string, number>>(
    {},
  );

  const onLoadedMetadata = useCallback<LoadedMetadataHandler>(
    ({ id, duration }) => {
      setAudioDurations((audioLengths) => ({
        ...audioLengths,
        [id]: duration,
      }));
    },
    [],
  );

  const fetcher = useFetcherIgnoreErrors<typeof showDataLoader>();
  useEffect(() => {
    const SECONDS = 1000;
    const refetchInterval = setInterval(
      () => {
        fetcher.load(`/${loaderData.id}/data.json`);
      },
      ci ? 3 * SECONDS : 60 * SECONDS,
    );

    return () => {
      clearTimeout(refetchInterval);
    };
  }, [ci, fetcher, loaderData.id]);

  const data = fetcher.data ?? loaderData;

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
      });
  }, [audioDurations, clientTimeSkewMs, data.sets]);

  const currentSetIndex = sets.findIndex((set) =>
    isBefore(Date.now(), set.end),
  );
  const currentSet = currentSetIndex === -1 ? undefined : sets[currentSetIndex];
  const nextSet =
    currentSetIndex === -1 ? undefined : sets[currentSetIndex + 1];

  const timeInfo: TargetTimeInfo = currentSet
    ? isBefore(Date.now(), currentSet.start)
      ? {
          status: 'WAITING_UNTIL_START',
          secondsUntilSet: Math.ceil(
            (currentSet.start.valueOf() - Date.now()) / 1000,
          ),
        }
      : {
          status: 'PLAYING',
          currentTime: Math.floor(
            (Date.now() - currentSet.start.valueOf()) / 1000,
          ),
        }
    : { status: 'ENDED' };

  useClock(enableClock && timeInfo.status !== 'ENDED');

  const targetShowInfo: TargetShowInfo = { ...timeInfo, currentSet, nextSet };

  return { targetShowInfo, onLoadedMetadata };
}
