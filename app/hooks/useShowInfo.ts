import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Temporal } from 'temporal-polyfill';

import type { ShowData } from '../../server/types/ShowData';
import type {
  TargetShowInfo,
  TargetTimeInfo,
} from '../../server/types/ShowInfo';
import { useTRPC } from '../trpc';
import { useClock } from './useClock';

type LoadedMetadataHandler = (args: { id: string; duration: number }) => void;

function isBefore(a: Temporal.Instant, b: Temporal.Instant): boolean {
  return Temporal.Instant.compare(a, b) === -1;
}

export function useShowInfo(
  showData: ShowData | undefined,
  { ci = false, enableClock = true } = {},
): {
  targetShowInfo: TargetShowInfo;
  onLoadedMetadata: LoadedMetadataHandler;
} {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

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
          queryKey: trpc.show.getShowData.queryKey({ slug: showData?.slug }),
        });
      },
      ci ? 3 * SECONDS : 60 * SECONDS,
    );

    return () => {
      clearTimeout(refetchInterval);
    };
    // todo(react-19): use useEffectEvent to remove unnecessary dependencies
  }, [ci, queryClient, showData?.slug, trpc.show.getShowData]);

  const clientTimeSkewMs = useMemo(() => {
    if (!showData?.serverDate) return 0;

    const serverDate = Temporal.Instant.from(showData.serverDate);

    return (
      Temporal.Now.instant().epochMilliseconds - serverDate.epochMilliseconds
    );
  }, [showData?.serverDate]);

  const sets = useMemo(() => {
    return (showData?.sets ?? [])
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
  }, [audioDurations, clientTimeSkewMs, showData?.sets]);

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

  if (!showData) {
    return {
      targetShowInfo: { status: 'WAITING_UNTIL_START' },
      onLoadedMetadata,
    };
  }

  return { targetShowInfo, onLoadedMetadata };
}
