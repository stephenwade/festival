import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Temporal } from 'temporal-polyfill';

import { useTRPC } from '../trpc';
import type { TargetShowInfo, TargetTimeInfo } from '../types/ShowInfo';
import { useClock } from './useClock';

type LoadedMetadataHandler = (args: { id: string; duration: number }) => void;

function isBefore(a: Temporal.Instant, b: Temporal.Instant): boolean {
  return Temporal.Instant.compare(a, b) === -1;
}

export function useShowInfo(
  slug: string,
  { ci = false, enableClock = true } = {},
): {
  targetShowInfo: TargetShowInfo;
  onLoadedMetadata?: LoadedMetadataHandler;
} {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data } = useQuery(trpc.show.getShowData.queryOptions({ slug }));

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

  useEffect(() => {
    const SECONDS = 1000;
    const refetchInterval = setInterval(
      () => {
        void queryClient.invalidateQueries({
          queryKey: trpc.show.getShowData.queryKey({ slug }),
        });
      },
      ci ? 3 * SECONDS : 60 * SECONDS,
    );

    return () => {
      clearTimeout(refetchInterval);
    };
    // todo(react-19): use useEffectEvent to remove unnecessary dependencies
  }, [ci, queryClient, slug, trpc.show.getShowData]);

  const clientTimeSkewMs = useMemo(() => {
    if (!data?.serverDate) return 0;

    const serverDate = Temporal.Instant.from(data.serverDate);

    return (
      Temporal.Now.instant().epochMilliseconds - serverDate.epochMilliseconds
    );
  }, [data?.serverDate]);

  const sets = useMemo(() => {
    if (!data?.sets) return [];
    return data.sets
      .map(function parseDates(set) {
        const start = Temporal.Instant.from(set.start);

        const length = audioDurations[set.id] ?? set.duration;
        const end = start.add({
          // `.add()` requires integers
          // seconds: length,
          milliseconds: Math.round(length * 1000),
        });

        return { ...set, start, end };
      })
      .map(function adjustForClientTimeSkew(set) {
        const start = set.start.add({ milliseconds: clientTimeSkewMs });
        const end = set.end.add({ milliseconds: clientTimeSkewMs });

        return { ...set, start, end };
      });
  }, [audioDurations, clientTimeSkewMs, data?.sets]);

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

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (globalThis.window === undefined || !data) {
    return { targetShowInfo: { status: 'WAITING_UNTIL_START' } };
  }

  return { targetShowInfo, onLoadedMetadata };
}
