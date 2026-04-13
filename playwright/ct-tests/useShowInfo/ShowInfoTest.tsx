import { useSuspenseQuery } from '@tanstack/react-query';
import { type FC, Suspense } from 'react';

import { useShowInfo } from '../../../app/hooks/useShowInfo';
import { useTRPC } from '../../../app/trpc';
import { MockedTRPCProvider } from '../trpc';

function ShowInfoDisplay() {
  const trpc = useTRPC();
  const { data: showData } = useSuspenseQuery(
    trpc.show.getShowData.queryOptions({ slug: 'test' }),
  );

  const { targetShowInfo } = useShowInfo(showData, {
    ci: true,
    enableClock: false,
  });

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

export const ShowInfoTest: FC = () => {
  return (
    <MockedTRPCProvider>
      <Suspense>
        <ShowInfoDisplay />
      </Suspense>
    </MockedTRPCProvider>
  );
};
