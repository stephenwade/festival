import { expect, test } from '@playwright/test';
import { addMinutes } from 'date-fns';

import { deleteShow, randomShowId, seedShow } from '../helpers/show';

let adminShowId: string;

test.beforeAll(async () => {
  const adminShow = await seedShow(addMinutes(new Date(), 5));
  adminShowId = adminShow.id;
});

test.afterAll(async () => {
  await deleteShow(adminShowId);
});

test('can change show name and URL', async ({ page, baseURL }) => {
  const newShowId = randomShowId();

  await page.goto('/admin/shows');

  await page.getByRole('link', { name: `Test Show (${adminShowId})` }).click();
  await page.getByRole('link', { name: 'Edit', exact: true }).click();
  await page.getByLabel('URL:').fill(newShowId);
  await page.getByLabel('Name:').fill('Edited Show');
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page).toHaveURL(`${baseURL}/admin/shows/${newShowId}`);

  await page.goto(`/${newShowId}`);
  await expect(page).toHaveURL(`${baseURL}/${newShowId}`);

  await page.goto('/admin/shows');
  await page.getByRole('link', { name: `Edited Show (${newShowId})` }).click();
  await page.getByRole('link', { name: 'Edit', exact: true }).click();
  await page.getByLabel('URL:').fill(adminShowId);
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page).toHaveURL(`${baseURL}/admin/shows/${adminShowId}`);
});
