import { platform } from 'node:process';

import { expect, test } from '@playwright/test';

import { delayShow } from '../helpers/show';

test('root URL redirects to earliest upcoming show', async ({
  page,
  baseURL,
}) => {
  await page.goto('/');

  await expect(page).toHaveURL(`${baseURL!}/${process.env.SHOW_SLUG!}`);
});

test('not found show redirects to earliest upcoming show', async ({
  page,
  baseURL,
}) => {
  await page.goto('/not-found');

  await expect(page).toHaveURL(`${baseURL!}/${process.env.SHOW_SLUG!}`);
});

test('show URL redirects to path without trailing slash', async ({
  page,
  baseURL,
}) => {
  await page.goto(`/${process.env.SHOW_SLUG!}/`);

  await expect(page).toHaveURL(`${baseURL!}/${process.env.SHOW_SLUG!}`);
});

test('plays the default show', async ({ page, browserName }) => {
  await delayShow(process.env.SHOW_SLUG!);

  await page.goto(`/${process.env.SHOW_SLUG!}`);

  await page.getByRole('button', { name: 'LISTEN LIVE' }).click();

  await expect(page.locator('.current-time')).toHaveText('0:02', {
    timeout: 15_000,
  });
  await expect(page.locator('.next-up')).toHaveText('NEXT UP');

  test.fail(
    browserName === 'webkit' && platform !== 'darwin',
    "Playing audio doesn't work on Webkit outside of macOS",
  );

  await expect(page.locator('.current-time')).toHaveText('0:05', {
    timeout: 10_000,
  });
  await expect(page.locator('.artist')).toHaveText(
    process.env.FIRST_ARTIST_NAME!,
  );
});
