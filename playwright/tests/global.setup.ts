import { test as setup } from '@playwright/test';

import { seedShow } from '../helpers/show';

/**
 * Ideally, I would use a fixture to provide the seeded show to each test.
 * However, the tests depend on the behavior that navigating to the root URL
 * will redirect to the earliest upcoming show. If I use a fixture to create a
 * different show for each worker, then the root URL may not redirect to the
 * show that the test is expecting.
 */

setup('seed show', async () => {
  const show = await seedShow();

  process.env.SHOW_ID = show.id;
  process.env.FIRST_ARTIST_NAME = show.sets[0].artist;
});
