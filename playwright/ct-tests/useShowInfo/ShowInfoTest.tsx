import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { createRemixStub } from '@remix-run/testing';
import { addSeconds } from 'date-fns';

import { useShowInfo } from '~/hooks/useShowInfo';
import type { ShowData } from '~/types/ShowData';

interface Props {
  offsetSec: number;
  serverDateOverride?: Date;
}

function getMockDataAtOffset({
  offsetSec,
  serverDateOverride,
}: Props): Pick<ShowData, 'serverDate' | 'sets'> {
  const now = new Date();

  return {
    serverDate: (serverDateOverride ?? now).toISOString(),
    sets: [
      {
        id: 'cd062b08-596b-3dc7-8e7a-67f4395361a1',
        audioUrl: 'sample/energy-fix.mp3',
        artist: 'Artist 1',
        start: addSeconds(now, 0 - offsetSec).toISOString(),
        duration: 181.34,
      },
      {
        id: '87c6d911-b348-3aa2-a8ee-9d4ab9dbe3ca',
        audioUrl: 'sample/bust-this-bust-that.mp3',
        artist: 'Artist 2',
        start: addSeconds(now, 250 - offsetSec).toISOString(),
        duration: 268.64,
      },
      {
        id: '1f22deda-9263-3aef-b66a-aa58c48cd30e',
        audioUrl: 'sample/one-ride.mp3',
        artist: 'Artist 3',
        start: addSeconds(now, 550 - offsetSec).toISOString(),
        duration: 183.72,
      },
    ],
  };
}

function ShowInfoDisplay() {
  const data = useLoaderData<ReturnType<typeof getMockDataAtOffset>>();
  const { targetShowInfo } = useShowInfo(data, { test: true });

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

export function ShowInfoTest(props: Props) {
  const RemixStub = createRemixStub([
    {
      path: '/',
      Component: ShowInfoDisplay,
      loader() {
        return json(getMockDataAtOffset(props));
      },
    },
  ]);

  return <RemixStub />;
}
