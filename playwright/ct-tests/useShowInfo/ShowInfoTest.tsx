import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { createRemixStub } from '@remix-run/testing';
import type { FC } from 'react';

import { useShowInfo } from '~/hooks/useShowInfo';

import type { TestProps } from './helpers';
import { getMockData } from './helpers';

function ShowInfoDisplay() {
  const data = useLoaderData<ReturnType<typeof getMockData>>();
  const { targetShowInfo } = useShowInfo(data, {
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

export const ShowInfoTest: FC<TestProps> = (props) => {
  const RemixStub = createRemixStub([
    {
      path: '/',
      Component: ShowInfoDisplay,
      loader() {
        return json(getMockData(props));
      },
    },
  ]);

  return <RemixStub />;
};
