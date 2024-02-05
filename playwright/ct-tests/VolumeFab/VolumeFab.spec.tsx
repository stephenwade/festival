import { expect, test } from '@playwright/experimental-ct-react';

import { VolumeFab } from '~/components/VolumeFab';

test('should display the current volume', async ({ mount }) => {
  const component = await mount(
    <VolumeFab volume={20} onVolumeInput={() => void 0} />,
  );

  await expect(component.locator('input')).toHaveValue('20');
});

test('should expand when clicked', async ({ mount }) => {
  const component = await mount(
    <VolumeFab volume={20} onVolumeInput={() => void 0} />,
  );

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
  await expect(component.locator('input')).not.toBeDisabled();
});

test('should fire onVolumeInput when the volume is dragged', async ({
  mount,
}) => {
  let volume = 20;
  const component = await mount(
    <VolumeFab
      volume={volume}
      onVolumeInput={(newVolume) => {
        volume = newVolume;
      }}
    />,
  );

  await component.locator('button').click();

  await component.locator('input').evaluate((input: HTMLInputElement) => {
    input.value = '30';
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });

  expect(volume).toBe(30);
});
