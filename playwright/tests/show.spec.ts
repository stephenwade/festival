import { expect, test } from '@playwright/test';

import { delayShow } from '../helpers/show';

test('root URL redirects to default show', async ({ page, baseURL }) => {
  await page.goto('/');

  await expect(page).toHaveURL(`${baseURL}/${process.env.SHOW_ID!}`);
});

test('not found show redirects to default show', async ({ page, baseURL }) => {
  await page.goto('/not-found');

  await expect(page).toHaveURL(`${baseURL}/${process.env.SHOW_ID!}`);
});

test('show URL redirects to path without trailing slash', async ({
  page,
  baseURL,
}) => {
  await page.goto(`/${process.env.SHOW_ID!}/`);

  await expect(page).toHaveURL(`${baseURL}/${process.env.SHOW_ID!}`);
});

test('plays the default show', async ({ page }) => {
  await delayShow(process.env.SHOW_ID!);

  await page.goto(`/${process.env.SHOW_ID!}`);

  await page.getByRole('button', { name: 'LISTEN LIVE' }).click();

  await expect(page.locator('.current-time')).toHaveText('0:02');
  await expect(page.locator('.next-up')).toHaveText('NEXT UP');

  await expect(page.locator('.current-time')).toHaveText('0:05');
  await expect(page.locator('.artist')).toHaveText(
    process.env.FIRST_ARTIST_NAME!,
  );
});
