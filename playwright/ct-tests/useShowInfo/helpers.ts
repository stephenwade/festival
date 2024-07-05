import { addSeconds } from 'date-fns';

import type { ShowData } from '~/types/ShowData';

export interface TestProps {
  offsetSec: number;
  serverDateOverride?: Date;
}

export function getMockData({
  offsetSec,
  serverDateOverride,
}: TestProps): Pick<ShowData, 'slug' | 'serverDate' | 'sets'> {
  const now = new Date();

  return {
    slug: 'test',
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
