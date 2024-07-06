import { test as teardown } from '@playwright/test';

import { deleteShow } from '../helpers/show';

teardown('delete show', async () => {
  await deleteShow(process.env.SHOW_SLUG!);
  await deleteShow(process.env.SHOW_LATER_SLUG!);
  await deleteShow(process.env.SHOW_EARLIER_SLUG!);
});
