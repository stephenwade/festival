import { expect, test } from '@playwright/test';

import { delayShow } from '../helpers/show';

test('has URL', async ({ page, baseURL }) => {
  await page.goto('/');

  await expect(page).toHaveURL(`${baseURL}/${process.env.SHOW_ID!}`);
});

test('plays the show', async ({ page }) => {
  await delayShow(process.env.SHOW_ID!);

  await page.goto('/');

  await page.getByRole('button', { name: 'LISTEN LIVE' }).click();

  await page.waitForSelector('.current-time >> text="0:01"');
  await expect(page.locator('.next-up')).toHaveText('NEXT UP');

  await page.waitForSelector('.current-time >> text="0:05"');
  await expect(page.locator('.artist')).toHaveText(
    process.env.FIRST_ARTIST_NAME!,
  );
});
