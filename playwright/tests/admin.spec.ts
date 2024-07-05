import { expect, test } from '@playwright/test';
import { addMinutes } from 'date-fns';

import { deleteShow, randomShowSlug, seedShow } from '../helpers/show';

let adminShowId: string;

test.beforeAll(async () => {
  const adminShow = await seedShow(addMinutes(new Date(), 5));
  adminShowId = adminShow.id;
});

test.afterAll(async () => {
  await deleteShow(adminShowId);
});

test('can change show name and URL', async ({ page, baseURL }) => {
  const newShowSlug = randomShowSlug();

  await page.goto('/admin/shows');

  await page.getByRole('link', { name: `Test Show (${adminShowId})` }).click();
  await page.getByRole('link', { name: 'Edit', exact: true }).click();
  await page.getByLabel('URL:').fill(newShowSlug);
  await page.getByLabel('Name:').fill('Edited Show');
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page).toHaveURL(`${baseURL}/admin/shows/${newShowSlug}`);

  await page.goto(`/${newShowSlug}`);
  await expect(page).toHaveURL(`${baseURL}/${newShowSlug}`);

  await page.goto('/admin/shows');
  await page
    .getByRole('link', { name: `Edited Show (${newShowSlug})` })
    .click();
  await page.getByRole('link', { name: 'Edit', exact: true }).click();
  await page.getByLabel('URL:').fill(adminShowId);
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page).toHaveURL(`${baseURL}/admin/shows/${adminShowId}`);
});
