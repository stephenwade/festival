/* eslint-disable playwright/no-wait-for-timeout */

import { expect, test } from '@playwright/experimental-ct-react';

import { AudioCanvasTest } from './AudioCanvasTest';

test.describe('reduceMotion false', () => {
  test('canvas looks different with sound and no sound', async ({
    mount,
    page,
  }) => {
    const component = await mount(
      <AudioCanvasTest forceReduceMotion={false} />,
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
    const component = await mount(<AudioCanvasTest forceReduceMotion={true} />);

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
