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

  test('has a canvas with something drawn on it', async ({ mount }) => {
    const component = await mount(
      <ShowPlayingTest status="PLAYING" currentTime={10} />,
    );

    await component.getByText('Enable canvas data').click();

    await expect
      .poll(async () => {
        return await component
          .locator('canvas')
          .evaluate((el: HTMLCanvasElement) =>
            el
              .getContext('2d')!
              .getImageData(0, 0, el.width, el.height)
              .data.some((channel) => channel !== 0),
          );
      }, 'canvas has some non-blank pixels')
      .toBe(true);
  });

  test.describe('reduceMotion false', () => {
    test('canvas looks different with sound and no sound', async ({
      mount,
      page,
    }) => {
      const component = await mount(
        <ShowPlayingTest status="PLAYING" currentTime={10} />,
      );

      await component.getByText('Enable canvas data').click();
      await page.waitForTimeout(200);

      await component.getByText('Take snapshot 1').click();
      const imageDataSound = await component
        .getByTestId('snapshot-1-hash')
        .textContent();

      await component.getByText('Disable canvas data').click();
      await page.waitForTimeout(200);

      await component.getByText('Take snapshot 2').click();
      const imageDataNoSound = await component
        .getByTestId('snapshot-2-hash')
        .textContent();

      expect(imageDataSound).not.toEqual(imageDataNoSound);
    });
  });

  test.describe('reduceMotion true', () => {
    test('canvas looks identical with sound and no sound', async ({
      mount,
      page,
    }) => {
      const component = await mount(
        <ShowPlayingTest status="PLAYING" currentTime={10} forceReduceMotion />,
      );

      await component.getByText('Enable canvas data').click();
      await page.waitForTimeout(200);

      await component.getByText('Take snapshot 1').click();
      const imageDataSound = await component
        .getByTestId('snapshot-1-hash')
        .textContent();

      await component.getByText('Disable canvas data').click();
      await page.waitForTimeout(200);

      await component.getByText('Take snapshot 2').click();
      const imageDataNoSound = await component
        .getByTestId('snapshot-2-hash')
        .textContent();

      expect(imageDataSound).toEqual(imageDataNoSound);
    });
  });
});
