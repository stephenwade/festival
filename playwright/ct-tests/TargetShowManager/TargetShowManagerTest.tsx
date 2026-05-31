import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { Suspense, useEffect, useState } from 'react';

import { TargetShowManager } from '../../../app/playback/TargetShowManager';
import { useTRPC } from '../../../app/trpc';
import type { TargetShowInfo } from '../../../server/types/ShowInfo';
import { MockedTRPCProvider } from '../trpc';

interface ShowInfoDisplayProps {
  targetShowInfo: TargetShowInfo;
}

function ShowInfoDisplay({ targetShowInfo }: ShowInfoDisplayProps) {
  const { status, currentSet, nextSet } = targetShowInfo;

  const displaySets = (
    <>
      <p>Current set: {currentSet?.artist ?? 'None'}</p>
      <p>Next set: {nextSet?.artist ?? 'None'}</p>
    </>
  );

  if (status === 'WAITING_UNTIL_START') {
    const { secondsUntilSet } = targetShowInfo;
    return (
      <div>
        <p>Status: {status}</p>
        <p>Seconds until set: {secondsUntilSet}</p>
        {displaySets}
      </div>
    );
  }

  if (status === 'PLAYING') {
    const { currentTime, delay } = targetShowInfo;
    return (
      <div>
        <p>Status: {status}</p>
        <p>Current time: {currentTime}</p>
        <p>Delay: {delay}</p>
        {displaySets}
      </div>
    );
  }

  return (
    <div>
      <p>Status: {status}</p>
      {displaySets}
    </div>
  );
}

function ShowInfoLoader() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const showDataQueryOptions = trpc.show.getShowData.queryOptions({
    slug: 'test',
  });
  const { data: showData } = useSuspenseQuery(showDataQueryOptions);
  const [manager] = useState(
    () =>
      new TargetShowManager(
        showData,
        () => queryClient.fetchQuery(showDataQueryOptions),
        { ci: true, enableClock: false },
      ),
  );
  const [targetShowInfo, setTargetShowInfo] = useState<TargetShowInfo>(
    () => manager.targetShowInfo,
  );

  useEffect(() => {
    const unsubscribeTargetShowInfo = manager.addTargetShowInfoListener(
      (nextShowInfo) => {
        setTargetShowInfo(nextShowInfo);
      },
    );

    return () => {
      unsubscribeTargetShowInfo();
      manager.dispose();
    };
  }, [manager]);

  return <ShowInfoDisplay targetShowInfo={targetShowInfo} />;
}

export function TargetShowManagerTest() {
  return (
    <MockedTRPCProvider>
      <Suspense>
        <ShowInfoLoader />
      </Suspense>
    </MockedTRPCProvider>
  );
}
