import { useCallback, useEffect, useMemo, useState } from 'react';
import { Temporal } from 'temporal-polyfill';

import type { loader as showDataLoader } from '~/routes/$show.[data.json]';
import type { ShowData } from '~/types/ShowData';
import type { TargetShowInfo, TargetTimeInfo } from '~/types/ShowInfo';

import { useClock } from './useClock';
import { useFetcherIgnoreErrors } from './useFetcherIgnoreErrors';

type LoadedMetadataHandler = (args: { id: string; duration: number }) => void;

function isBefore(a: Temporal.Instant, b: Temporal.Instant): boolean {
  return Temporal.Instant.compare(a, b) === -1;
}

export function useShowInfo(
  loaderData: Pick<ShowData, 'slug' | 'serverDate' | 'sets'>,
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
        fetcher.load(`/${loaderData.slug}/data.json`);
      },
      ci ? 3 * SECONDS : 60 * SECONDS,
    );

    return () => {
      clearTimeout(refetchInterval);
    };
  }, [ci, fetcher, loaderData.slug]);

  const data = fetcher.data ?? loaderData;

  const clientTimeSkewMs = useMemo(() => {
    const serverDate = Temporal.Instant.from(data.serverDate);

    return (
      Temporal.Now.instant().epochMilliseconds - serverDate.epochMilliseconds
    );
  }, [data.serverDate]);

  const sets = useMemo(() => {
    return data.sets
      .map(function parseDates(set) {
        const start = Temporal.Instant.from(set.start);

        const length = audioDurations[set.id] ?? set.duration;
        const end = start.add({ seconds: length });

        return { ...set, start, end };
      })
      .map(function adjustForClientTimeSkew(set) {
        const start = set.start.add({ milliseconds: clientTimeSkewMs });
        const end = set.end.add({ milliseconds: clientTimeSkewMs });

        return { ...set, start, end };
      });
  }, [audioDurations, clientTimeSkewMs, data.sets]);

  const currentSetIndex = sets.findIndex((set) =>
    isBefore(Temporal.Now.instant(), set.end),
  );
  const currentSet = currentSetIndex === -1 ? undefined : sets[currentSetIndex];
  const nextSet =
    currentSetIndex === -1 ? undefined : sets[currentSetIndex + 1];

  const timeInfo: TargetTimeInfo = currentSet
    ? isBefore(Temporal.Now.instant(), currentSet.start)
      ? {
          status: 'WAITING_UNTIL_START',
          secondsUntilSet: Math.ceil(
            Temporal.Now.instant()
              .until(currentSet.start)
              .total({ unit: 'seconds' }),
          ),
        }
      : {
          status: 'PLAYING',
          currentTime: Math.floor(
            currentSet.start
              .until(Temporal.Now.instant())
              .total({ unit: 'seconds' }),
          ),
        }
    : { status: 'ENDED' };

  useClock(enableClock && timeInfo.status !== 'ENDED');

  const targetShowInfo: TargetShowInfo = { ...timeInfo, currentSet, nextSet };

  return { targetShowInfo, onLoadedMetadata };
}
