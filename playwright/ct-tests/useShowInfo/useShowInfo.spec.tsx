import type { RouterFixture } from '@playwright/experimental-ct-core';
import { expect, test } from '@playwright/experimental-ct-react';
import { Temporal } from 'temporal-polyfill';

import type { ShowData } from '../../../server/types/ShowData';
import { trpcMsw } from '../trpc';
import { ShowInfoTest } from './ShowInfoTest';

interface TestProps {
  offsetSec: number;
  serverDateOverride?: string;
}

function getMockData({ offsetSec, serverDateOverride }: TestProps): ShowData {
  const now = Temporal.Now.instant();

  return {
    name: 'Test Show',
    slug: 'test',
    description: 'The best radio show on GitHub Actions!',
    serverDate: serverDateOverride ?? now.toString(),
    showLogoUrl: '',
    backgroundImageUrl: '',
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

async function setupMock(props: TestProps, router: RouterFixture) {
  await router.use(trpcMsw.show.getShowData.query(() => getMockData(props)));
}

test('1 minute before the show', async ({ mount, router }) => {
  await setupMock({ offsetSec: -1 * 60 }, router);

  const component = await mount(<ShowInfoTest />);

  await expect(component).toContainText('Status: WAITING_UNTIL_START');
  await expect(component).toContainText('Seconds until set: 60');
  await expect(component).toContainText('Current set: Artist 1');
  await expect(component).toContainText('Next set: Artist 2');
});

function pluralize(word: string, count: number): string {
  return count === 1 ? word : `${word}s`;
}

for (const offsetMin of [1, 2, 3]) {
  const offsetSec = offsetMin * 60;

  test(`${offsetMin} ${pluralize('minute', offsetMin)} into the show`, async ({
    mount,
    router,
  }) => {
    await setupMock({ offsetSec }, router);

    const component = await mount(<ShowInfoTest />);

    await expect(component).toContainText('Status: PLAYING');
    await expect(component).toContainText(`Current time: ${offsetSec}`);
    await expect(component).toContainText('Current set: Artist 1');
    await expect(component).toContainText('Next set: Artist 2');
  });
}

test('4 minutes into the show', async ({ mount, router }) => {
  await setupMock({ offsetSec: 4 * 60 }, router);

  const component = await mount(<ShowInfoTest />);

  await expect(component).toContainText('Status: WAITING_UNTIL_START');
  await expect(component).toContainText('Seconds until set: 10');
  await expect(component).toContainText('Current set: Artist 2');
  await expect(component).toContainText('Next set: Artist 3');
});

for (const offsetMin of [5, 6, 7, 8]) {
  const offsetSec = offsetMin * 60;

  test(`${offsetMin} minutes into the show`, async ({ mount, router }) => {
    await setupMock({ offsetSec }, router);

    const component = await mount(<ShowInfoTest />);

    await expect(component).toContainText('Status: PLAYING');
    await expect(component).toContainText(`Current time: ${offsetSec - 250}`);
    await expect(component).toContainText('Current set: Artist 2');
    await expect(component).toContainText('Next set: Artist 3');
  });
}

test('9 minutes into the show', async ({ mount, router }) => {
  await setupMock({ offsetSec: 9 * 60 }, router);

  const component = await mount(<ShowInfoTest />);

  await expect(component).toContainText('Status: WAITING_UNTIL_START');
  await expect(component).toContainText('Seconds until set: 10');
  await expect(component).toContainText('Current set: Artist 3');
  await expect(component).toContainText('Next set: None');
});

for (const offsetMin of [10, 11, 12]) {
  const offsetSec = offsetMin * 60;

  test(`${offsetMin} minutes into the show`, async ({ mount, router }) => {
    await setupMock({ offsetSec }, router);

    const component = await mount(<ShowInfoTest />);

    await expect(component).toContainText('Status: PLAYING');
    await expect(component).toContainText(`Current time: ${offsetSec - 550}`);
    await expect(component).toContainText('Current set: Artist 3');
    await expect(component).toContainText('Next set: None');
  });
}

test('after the show', async ({ mount, router }) => {
  await setupMock({ offsetSec: 13 * 60 }, router);

  const component = await mount(<ShowInfoTest />);

  await expect(component).toContainText('Status: ENDED');
  await expect(component).toContainText('Current set: None');
  await expect(component).toContainText('Next set: None');
});

test('adjusts start time based on server clock', async ({ mount, router }) => {
  await setupMock(
    {
      offsetSec: 0,
      serverDateOverride: Temporal.Now.instant()
        .add({ seconds: 10 })
        .toString(),
    },
    router,
  );

  const component = await mount(<ShowInfoTest />);

  await expect(component).toContainText('Status: PLAYING');
  await expect(component).toContainText('Current time: 9');
  await expect(component).toContainText('Current set: Artist 1');
  await expect(component).toContainText('Next set: Artist 2');
});

test('should fetch new data after a few seconds', async ({ mount, router }) => {
  await setupMock({ offsetSec: 0 }, router);

  const component = await mount(<ShowInfoTest />);

  await expect(component).not.toContainText('(FUTURE)');

  await router.use(
    trpcMsw.show.getShowData.query(() => {
      const data = getMockData({ offsetSec: 0 });
      return {
        ...data,
        sets: data.sets.map((set) => ({
          ...set,
          artist: `${set.artist} (FUTURE)`,
        })),
      };
    }),
  );

  await expect(component).toContainText('(FUTURE)');
});
