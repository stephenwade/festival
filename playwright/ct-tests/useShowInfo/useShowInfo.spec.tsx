import { expect, test } from '@playwright/experimental-ct-react';
import { Temporal } from 'temporal-polyfill';

import { getMockData } from './helpers';
import { ShowInfoTest } from './ShowInfoTest';

test('1 minute before the show', async ({ mount }) => {
  const component = await mount(<ShowInfoTest offsetSec={-1 * 60} />);

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
  }) => {
    const component = await mount(<ShowInfoTest offsetSec={offsetSec} />);

    await expect(component).toContainText('Status: PLAYING');
    await expect(component).toContainText(`Current time: ${offsetSec}`);
    await expect(component).toContainText('Current set: Artist 1');
    await expect(component).toContainText('Next set: Artist 2');
  });
}

test('4 minutes into the show', async ({ mount }) => {
  const component = await mount(<ShowInfoTest offsetSec={4 * 60} />);

  await expect(component).toContainText('Status: WAITING_UNTIL_START');
  await expect(component).toContainText('Seconds until set: 10');
  await expect(component).toContainText('Current set: Artist 2');
  await expect(component).toContainText('Next set: Artist 3');
});

for (const offsetMin of [5, 6, 7, 8]) {
  const offsetSec = offsetMin * 60;
  test(`${offsetMin} minutes into the show`, async ({ mount }) => {
    const component = await mount(<ShowInfoTest offsetSec={offsetSec} />);

    await expect(component).toContainText('Status: PLAYING');
    await expect(component).toContainText(`Current time: ${offsetSec - 250}`);
    await expect(component).toContainText('Current set: Artist 2');
    await expect(component).toContainText('Next set: Artist 3');
  });
}

test('9 minutes into the show', async ({ mount }) => {
  const component = await mount(<ShowInfoTest offsetSec={9 * 60} />);

  await expect(component).toContainText('Status: WAITING_UNTIL_START');
  await expect(component).toContainText('Seconds until set: 10');
  await expect(component).toContainText('Current set: Artist 3');
  await expect(component).toContainText('Next set: None');
});

for (const offsetMin of [10, 11, 12]) {
  const offsetSec = offsetMin * 60;
  test(`${offsetMin} minutes into the show`, async ({ mount }) => {
    const component = await mount(<ShowInfoTest offsetSec={offsetSec} />);

    await expect(component).toContainText('Status: PLAYING');
    await expect(component).toContainText(`Current time: ${offsetSec - 550}`);
    await expect(component).toContainText('Current set: Artist 3');
    await expect(component).toContainText('Next set: None');
  });
}

test('after the show', async ({ mount }) => {
  const component = await mount(<ShowInfoTest offsetSec={13 * 60} />);

  await expect(component).toContainText('Status: ENDED');
  await expect(component).toContainText('Current set: None');
  await expect(component).toContainText('Next set: None');
});

test('adjusts start time based on server clock', async ({ mount }) => {
  const component = await mount(
    <ShowInfoTest
      offsetSec={0}
      serverDateOverride={Temporal.Now.instant()
        .add({ seconds: 10 })
        .toString()}
    />,
  );

  await expect(component).toContainText('Status: PLAYING');
  await expect(component).toContainText('Current time: 9');
  await expect(component).toContainText('Current set: Artist 1');
  await expect(component).toContainText('Next set: Artist 2');
});

test('should fetch new data from data.json after a few seconds', async ({
  mount,
  page,
}) => {
  await page.route('/test/data.json', async (route) => {
    const data = getMockData({ offsetSec: 0 });
    const json = {
      ...data,
      sets: data.sets.map((set) => ({
        ...set,
        artist: `${set.artist} (from data.json)`,
      })),
    };
    await route.fulfill({ json });
  });

  const component = await mount(<ShowInfoTest offsetSec={0} />);

  await expect(component).not.toContainText('(from data.json)');

  await expect(component).toContainText('(from data.json)');
});
