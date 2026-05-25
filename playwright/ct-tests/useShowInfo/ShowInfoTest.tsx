import { useSuspenseQuery } from '@tanstack/react-query';
import { Suspense } from 'react';

import { PlaybackProvider, useTargetShowInfo } from '../../../app/playback';
import { useTRPC } from '../../../app/trpc';
import { MockedTRPCProvider } from '../trpc';

function ShowInfoDisplay() {
  const targetShowInfo = useTargetShowInfo();

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
  const { data: showData } = useSuspenseQuery(
    trpc.show.getShowData.queryOptions({ slug: 'test' }),
  );

  return (
    <PlaybackProvider
      showData={showData}
      targetShowParams={{ ci: true, enableClock: false }}
    >
      <ShowInfoDisplay />
    </PlaybackProvider>
  );
}

export function ShowInfoTest() {
  return (
    <MockedTRPCProvider>
      <Suspense>
        <ShowInfoLoader />
      </Suspense>
    </MockedTRPCProvider>
  );
}
