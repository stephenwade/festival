import { expect, test } from '@playwright/experimental-ct-react';

import { ShowPlayingTest } from './ShowPlayingTest';

test.describe('while waiting for start', () => {
  test('includes the words "NEXT UP"', async ({ mount }) => {
    const component = await mount(
      <ShowPlayingTest status="WAITING_UNTIL_START" secondsUntilSet={10} />,
    );

    await expect(component).toContainText('NEXT UP');
  });

  test('includes the artist name', async ({ mount }) => {
    const component = await mount(
      <ShowPlayingTest status="WAITING_UNTIL_START" secondsUntilSet={10} />,
    );

    await expect(component).toContainText('Fulton');
  });

  test('includes minutes and seconds', async ({ mount }) => {
    const component = await mount(
      <ShowPlayingTest status="WAITING_UNTIL_START" secondsUntilSet={165} />,
    );

    await expect(component).toContainText('2:45');
    await expect(component).not.toContainText('02:45');
  });

  test('includes hours if there is an hour or more until the set', async ({
    mount,
  }) => {
    const component = await mount(
      <ShowPlayingTest
        status="WAITING_UNTIL_START"
        secondsUntilSet={165 + 3600}
      />,
    );

    await expect(component).toContainText('1:02:45');
    await expect(component).not.toContainText('01:02:45');
  });
});

test.describe('while playing', () => {
  test('does not include the words "NEXT UP"', async ({ mount }) => {
    const component = await mount(
      <ShowPlayingTest status="PLAYING" currentTime={10} />,
    );

    await expect(component).not.toContainText('NEXT UP');
  });

  test('includes the artist name', async ({ mount }) => {
    const component = await mount(
      <ShowPlayingTest status="PLAYING" currentTime={10} />,
    );

    await expect(component).toContainText('Dana');
  });

  test('includes minutes and seconds', async ({ mount }) => {
    const component = await mount(
      <ShowPlayingTest status="PLAYING" currentTime={295} />,
    );

    await expect(component).toContainText('4:55');
    await expect(component).not.toContainText('04:55');
  });

  test('includes hours if the current time is more than an hour', async ({
    mount,
  }) => {
    const component = await mount(
      <ShowPlayingTest status="PLAYING" currentTime={295 + 3600} />,
    );

    await expect(component).toContainText('1:04:55');
    await expect(component).not.toContainText('01:04:55');
  });
});
