import { expect, test as base } from '@playwright/test';
import type { Show } from '@prisma/client';
import { Temporal } from 'temporal-polyfill';

import { deleteShow, randomShowSlug, seedShow } from '../helpers/show';

const test = base.extend<{ adminShow: Show }>({
  adminShow: async ({}, use) => {
    const adminShow = await seedShow(
      Temporal.Now.instant().add({ minutes: 5 }),
    );

    await use(adminShow);

    await deleteShow(adminShow.slug);
  },
});

test('can change show name and URL', async ({ page, baseURL, adminShow }) => {
  const newShowSlug = randomShowSlug();

  await page.goto('/admin/shows');

  await page
    .getByRole('link', { name: `Test Show (${adminShow.slug})` })
    .click();
  await page.getByRole('link', { name: 'Edit', exact: true }).click();
  await page.getByLabel('URL:').fill(newShowSlug);
  await page.getByLabel('Name:').fill('Edited Show');
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page).toHaveURL(`${baseURL!}/admin/shows/${adminShow.id}`);

  await page.goto(`/${newShowSlug}`);
  await expect(page).toHaveURL(`${baseURL!}/${newShowSlug}`);

  await page.goto('/admin/shows');
  await page
    .getByRole('link', { name: `Edited Show (${newShowSlug})` })
    .click();
  await page.getByRole('link', { name: 'Edit', exact: true }).click();
  await page.getByLabel('URL:').fill(adminShow.slug);
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page).toHaveURL(`${baseURL!}/admin/shows/${adminShow.id}`);
});
