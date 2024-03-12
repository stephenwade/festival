import { expect, test } from '@playwright/experimental-ct-react';

import { ClockTest } from './ClockTest';

test('should render multiple times', async ({ mount }) => {
  const component = await mount(<ClockTest />);

  await expect(component).toContainText(/[3-5]/u);
});
