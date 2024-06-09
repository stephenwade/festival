import { test as setup } from '@playwright/test';
import { addSeconds } from 'date-fns';

import { deleteTestShows, seedShow } from '../helpers/show';
import { authFile } from './shared-data';

/**
 * Ideally, I would use a fixture to provide the seeded show to each test.
 * However, the tests depend on the behavior that navigating to the root URL
 * will redirect to the earliest upcoming show. If I use a fixture to create a
 * different show for each worker, then the root URL may not redirect to the
 * show that the test is expecting.
 */

setup('seed show', async () => {
  await deleteTestShows();

  const show = await seedShow(addSeconds(new Date(), 10));
  process.env.SHOW_ID = show.id;
  process.env.FIRST_ARTIST_NAME = show.sets[0].artist;

  // Add other shows to ensure that the root URL redirects to the earliest
  // upcoming show
  const showLater = await seedShow(addSeconds(new Date(), 60));
  process.env.SHOW_LATER_ID = showLater.id;
  const showEarlier = await seedShow(addSeconds(new Date(), -60));
  process.env.SHOW_EARLIER_ID = showEarlier.id;
});

setup('authenticate', async ({ page, baseURL }) => {
  await page.goto('/admin');
  await page.getByLabel('Email address').click();
  await page.getByLabel('Email address').fill('ci@urlfest.com');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByLabel('Password', { exact: true }).fill('cipassword');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.waitForURL(`${baseURL}/admin/shows`);

  await page.context().storageState({ path: authFile });
});
