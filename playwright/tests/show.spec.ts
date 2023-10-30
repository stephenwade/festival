import { expect } from '@playwright/test';

import { test } from '../helpers/show';

test('has URL', async ({ page, show }) => {
  await page.goto('/');

  await expect(page).toHaveURL(new RegExp(show.id, 'u'));
});
