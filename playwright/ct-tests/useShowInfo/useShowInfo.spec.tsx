import { expect, test } from '@playwright/experimental-ct-react';
import { formatDistanceToNowStrict, subSeconds } from 'date-fns';

import { ShowInfoTest } from './ShowInfoTest';

test('1 minute before the show', async ({ mount }) => {
  const component = await mount(<ShowInfoTest offsetSec={-60} />);

  await expect(component).toContainText('Status: WAITING_UNTIL_START');
  await expect(component).toContainText('Seconds until set: 60');
  await expect(component).toContainText('Current set: Artist 1');
  await expect(component).toContainText('Next set: Artist 2');
});

for (const offsetSec of [60, 120, 180]) {
  const distance = formatDistanceToNowStrict(subSeconds(new Date(), offsetSec));
  test(`${distance} into the show`, async ({ mount }) => {
    const component = await mount(<ShowInfoTest offsetSec={offsetSec} />);

    await expect(component).toContainText('Status: PLAYING');
    await expect(component).toContainText(`Current time: ${offsetSec}`);
    await expect(component).toContainText('Current set: Artist 1');
    await expect(component).toContainText('Next set: Artist 2');
  });
}

test('4 minutes into the show', async ({ mount }) => {
  const component = await mount(<ShowInfoTest offsetSec={240} />);

  await expect(component).toContainText('Status: WAITING_UNTIL_START');
  await expect(component).toContainText('Seconds until set: 10');
  await expect(component).toContainText('Current set: Artist 2');
  await expect(component).toContainText('Next set: Artist 3');
});

for (const offsetSec of [300, 360, 420, 480]) {
  const distance = formatDistanceToNowStrict(subSeconds(new Date(), offsetSec));
  test(`${distance} into the show`, async ({ mount }) => {
    const component = await mount(<ShowInfoTest offsetSec={offsetSec} />);

    await expect(component).toContainText('Status: PLAYING');
    await expect(component).toContainText(`Current time: ${offsetSec - 250}`);
    await expect(component).toContainText('Current set: Artist 2');
    await expect(component).toContainText('Next set: Artist 3');
  });
}

test('9 minutes into the show', async ({ mount }) => {
  const component = await mount(<ShowInfoTest offsetSec={540} />);

  await expect(component).toContainText('Status: WAITING_UNTIL_START');
  await expect(component).toContainText('Seconds until set: 10');
  await expect(component).toContainText('Current set: Artist 3');
  await expect(component).toContainText('Next set: None');
});

for (const offsetSec of [600, 660, 720]) {
  const distance = formatDistanceToNowStrict(subSeconds(new Date(), offsetSec));
  test(`${distance} into the show`, async ({ mount }) => {
    const component = await mount(<ShowInfoTest offsetSec={offsetSec} />);

    await expect(component).toContainText('Status: PLAYING');
    await expect(component).toContainText(`Current time: ${offsetSec - 550}`);
    await expect(component).toContainText('Current set: Artist 3');
    await expect(component).toContainText('Next set: None');
  });
}

test('after the show', async ({ mount }) => {
  const component = await mount(<ShowInfoTest offsetSec={780} />);

  await expect(component).toContainText('Status: ENDED');
  await expect(component).toContainText('Current set: None');
  await expect(component).toContainText('Next set: None');
});
