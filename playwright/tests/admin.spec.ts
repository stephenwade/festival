import { expect, test } from '@playwright/test';
import { Temporal } from 'temporal-polyfill';

import { deleteShow, randomShowSlug, seedShow } from '../helpers/show';

let adminShowId: string;
let adminShowSlug: string;

test.beforeAll(async () => {
  const adminShow = await seedShow(Temporal.Now.instant().add({ minutes: 5 }));
  adminShowId = adminShow.id;
  adminShowSlug = adminShow.slug;
});

test.afterAll(async () => {
  await deleteShow(adminShowSlug);
});

test('can change show name and URL', async ({ page, baseURL }) => {
  const newShowSlug = randomShowSlug();

  await page.goto('/admin/shows');

  await page
    .getByRole('link', { name: `Test Show (${adminShowSlug})` })
    .click();
  await page.getByRole('link', { name: 'Edit', exact: true }).click();
  await page.getByLabel('URL:').fill(newShowSlug);
  await page.getByLabel('Name:').fill('Edited Show');
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page).toHaveURL(`${baseURL!}/admin/shows/${adminShowId}`);

  await page.goto(`/${newShowSlug}`);
  await expect(page).toHaveURL(`${baseURL!}/${newShowSlug}`);

  await page.goto('/admin/shows');
  await page
    .getByRole('link', { name: `Edited Show (${newShowSlug})` })
    .click();
  await page.getByRole('link', { name: 'Edit', exact: true }).click();
  await page.getByLabel('URL:').fill(adminShowSlug);
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page).toHaveURL(`${baseURL!}/admin/shows/${adminShowId}`);
});
