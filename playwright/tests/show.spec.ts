import { expect, test } from '@playwright/test';

test('has URL', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveURL(new RegExp(process.env.SHOW_ID!, 'u'));
});
