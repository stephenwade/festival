import { expect, test } from '@playwright/experimental-ct-react';
import type { Page } from '@playwright/test';

import { FetcherTest } from './FetcherTest';

async function setupMocks(page: Page) {
  await page.route('/a', async (route) => {
    await route.fulfill({
      json: { result: 'a' },
    });
  });
  await page.route('/c', async (route) => {
    await route.fulfill({
      json: { result: 'c' },
    });
  });
}

test('should return undefined before fetching', async ({ mount, page }) => {
  await setupMocks(page);

  const component = await mount(<FetcherTest />);

  await expect(component).toContainText('Fetcher data: undefined');
});

test('should fetch data', async ({ mount, page }) => {
  await setupMocks(page);

  const component = await mount(<FetcherTest />);

  await component.getByText('Fetch A').click();

  await expect(component).toContainText('Naive data: {"result":"a"}');
  await expect(component).toContainText('Fetcher data: {"result":"a"}');
});

test('should ignore errors', async ({ mount, page }) => {
  await setupMocks(page);

  const component = await mount(<FetcherTest />);

  await component.getByText('Fetch B').click();

  await expect(component).toContainText('Naive data: error');
  await expect(component).toContainText('Fetcher data: undefined');
});

test('should return last successful data', async ({ mount, page }) => {
  await setupMocks(page);

  const component = await mount(<FetcherTest />);

  await component.getByText('Fetch A').click();

  await expect(component).toContainText('Naive data: {"result":"a"}');
  await expect(component).toContainText('Fetcher data: {"result":"a"}');

  await component.getByText('Fetch B').click();

  await expect(component).toContainText('Naive data: error');
  await expect(component).toContainText('Fetcher data: {"result":"a"}');
});

test('should fetch after error', async ({ mount, page }) => {
  await setupMocks(page);

  const component = await mount(<FetcherTest />);

  await component.getByText('Fetch B').click();

  await expect(component).toContainText('Naive data: error');
  await expect(component).toContainText('Fetcher data: undefined');

  await component.getByText('Fetch C').click();

  await expect(component).toContainText('Naive data: {"result":"c"}');
  await expect(component).toContainText('Fetcher data: {"result":"c"}');
});
