import { Temporal } from 'temporal-polyfill';

import type { ShowData } from '~/types/ShowData';

export interface TestProps {
  offsetSec: number;
  serverDateOverride?: Temporal.Instant;
}

export function getMockData({
  offsetSec,
  serverDateOverride,
}: TestProps): Pick<ShowData, 'slug' | 'serverDate' | 'sets'> {
  const now = Temporal.Now.instant();

  return {
    slug: 'test',
    serverDate: (serverDateOverride ?? now).toString(),
    sets: [
      {
        id: 'cd062b08-596b-3dc7-8e7a-67f4395361a1',
        audioUrl: 'sample/energy-fix.mp3',
        artist: 'Artist 1',
        start: now.add({ seconds: 0 - offsetSec }).toString(),
        duration: 181.34,
      },
      {
        id: '87c6d911-b348-3aa2-a8ee-9d4ab9dbe3ca',
        audioUrl: 'sample/bust-this-bust-that.mp3',
        artist: 'Artist 2',
        start: now.add({ seconds: 250 - offsetSec }).toString(),
        duration: 268.64,
      },
      {
        id: '1f22deda-9263-3aef-b66a-aa58c48cd30e',
        audioUrl: 'sample/one-ride.mp3',
        artist: 'Artist 3',
        start: now.add({ seconds: 550 - offsetSec }).toString(),
        duration: 183.72,
      },
    ],
  };
}
