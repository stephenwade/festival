import { expect, test } from '@playwright/experimental-ct-react';

import { INITIAL_VOLUME } from './shared-data';
import { VolumeFabTest } from './VolumeFabTest';

test('should display the current volume', async ({ mount }) => {
  const component = await mount(<VolumeFabTest />);

  await expect(component.locator('input')).toHaveValue(String(INITIAL_VOLUME));
});

test('should expand when clicked', async ({ mount }) => {
  const component = await mount(<VolumeFabTest />);

  await expect(component.locator('.slider-container')).not.toHaveAttribute(
    'aria-expanded',
    'true',
  );
  await expect(component.locator('input')).toBeDisabled();

  await component.locator('button').click();

  await expect(component.locator('.slider-container')).toHaveAttribute(
    'aria-expanded',
    'true',
  );
  await expect(component.locator('input')).toBeEnabled();
});

test('should update the useVolume hook when the volume is dragged', async ({
  mount,
}) => {
  const component = await mount(<VolumeFabTest />);

  await component.locator('button').click();

  await component.locator('input').evaluate((input: HTMLInputElement) => {
    input.value = '30';
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });

  await expect(component).toContainText('Volume: 30');
});
