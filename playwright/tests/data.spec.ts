import { expect, test } from '@playwright/test';

import type { ShowData } from '../../app/types/ShowData';

test('data endpoint omits sets that are already over', async ({
  request,
  baseURL,
}) => {
  const response = await request.get(
    `${baseURL!}/${process.env.SHOW_EARLIER_SLUG!}/data.json`,
  );

  expect(response.status()).toBe(200);

  const data = (await response.json()) as ShowData;

  expect(data.sets).toEqual([]);
});

test('data endpoint redacts audio URL for the next set more than 2 minutes away', async ({
  request,
  baseURL,
}) => {
  const response = await request.get(
    `${baseURL!}/${process.env.SHOW_LATER_SLUG!}/data.json`,
  );

  expect(response.status()).toBe(200);

  const data = (await response.json()) as ShowData;

  expect(data.sets).toHaveLength(1);
  expect(data.sets[0]?.audioUrl).toBeUndefined();
});

test('data endpoint includes audio URL for sets that are currently playing or starting soon', async ({
  request,
  baseURL,
}) => {
  const response = await request.get(
    `${baseURL!}/${process.env.SHOW_SLUG!}/data.json`,
  );

  expect(response.status()).toBe(200);

  const data = (await response.json()) as ShowData;

  expect(data.sets.length).toBeGreaterThan(0);
  expect(data.sets[0]?.audioUrl).toBeDefined();
});
