import { expect as baseExpect, test } from '@playwright/experimental-ct-react';
import type { Locator } from '@playwright/test';

import { AudioControllerTest } from './AudioControllerTest';
import { AUDIO_FILE_LENGTH, AUDIO_FILE_URL, ID_1 } from './shared-data';

const expect = baseExpect.extend({
  toAlmostEqual: (value: number, expected: number) => {
    const tolerance = 0.5;
    const pass = Math.abs(value - expected) <= tolerance;
    return {
      pass,
      message: () =>
        `${value} almost equals ${expected} (tolerance ${tolerance})`,
    };
  },
});

async function expectAudioIsPlaying(component: Locator, message?: string) {
  const audio = component.locator('audio[src]').nth(0);
  const currentTime = await audio.evaluate(
    (el: HTMLAudioElement) => el.currentTime,
  );
  const paused = await audio.evaluate((el: HTMLAudioElement) => el.paused);

  expect(
    currentTime > 0 && !paused,
    `audio element is playing${message ? ` ${message}` : ''}`,
  );
}

async function expectAudioIsNotPlaying(component: Locator, message?: string) {
  const audio = component
    .locator('audio[src]')
    // If neither of the audio elements have a src, the test should pass.
    .or(component.locator('audio'))
    .nth(0);
  const currentTime = await audio.evaluate(
    (el: HTMLAudioElement) => el.currentTime,
  );
  const paused = await audio.evaluate((el: HTMLAudioElement) => el.paused);

  expect(
    currentTime === 0 || paused,
    `audio element is not playing${message ? ` ${message}` : ''}`,
  );
}

async function expectAudioCurrentTimeToAlmostEqual(
  component: Locator,
  expected: number,
) {
  const audio = component.locator('audio[src]').nth(0);
  const currentTime = await audio.evaluate(
    (el: HTMLAudioElement) => el.currentTime,
  );
  expect(currentTime).toAlmostEqual(expected);
}

function commonTests({ forceSkipAudioContext = false }) {
  test.describe('init', () => {
    const offsetSec = -5;

    test('renders two audio elements', async ({ mount }) => {
      const component = await mount(
        <AudioControllerTest
          offsetSec={offsetSec}
          forceSkipAudioContext={forceSkipAudioContext}
        />,
      );

      const audios = component.locator('audio');
      await expect(audios).toHaveCount(2);
      for (const audio of await audios.all()) {
        await expect(audio).toHaveAttribute('crossorigin', 'anonymous');
      }
    });

    test('calling initializeAudio() sets the show status', async ({
      mount,
    }) => {
      const component = await mount(
        <AudioControllerTest
          offsetSec={offsetSec}
          forceSkipAudioContext={forceSkipAudioContext}
        />,
      );

      await expect(component).toContainText(
        'Show status: WAITING_FOR_AUDIO_CONTEXT',
      );

      await component.getByTestId('init-button').click();

      await expect(component).toContainText('Show status: WAITING_UNTIL_START');
    });
  });

  test.describe('before the show', () => {
    const offsetSec = -2;

    test('does not play audio until the show starts', async ({
      mount,
      page,
    }) => {
      const component = await mount(
        <AudioControllerTest
          offsetSec={offsetSec}
          forceSkipAudioContext={forceSkipAudioContext}
        />,
      );
      await component.getByTestId('init-button').click();

      await page.waitForTimeout(400);
      await expectAudioIsNotPlaying(component, '2 seconds before the show');
      await page.waitForTimeout(1000);
      await expectAudioIsNotPlaying(component, '1 second before the show');
      await page.waitForTimeout(1000);
      await expectAudioIsPlaying(component, 'during the show');
      await expectAudioCurrentTimeToAlmostEqual(component, 0.4);
    });

    test('calls onLoadedMetadata with id and duration', async ({ mount }) => {
      const component = await mount(
        <AudioControllerTest
          offsetSec={offsetSec}
          forceSkipAudioContext={forceSkipAudioContext}
        />,
      );
      await component.getByTestId('init-button').click();

      await expect(component.getByTestId('metadata-event-id')).toHaveText(ID_1);
      const duration = await component
        .getByTestId('metadata-event-duration')
        .textContent();
      expect(Number(duration)).toAlmostEqual(AUDIO_FILE_LENGTH);
    });

    test('updates src immediately if set info is changed', async ({
      mount,
    }) => {
      const component = await mount(
        <AudioControllerTest
          offsetSec={offsetSec}
          forceSkipAudioContext={forceSkipAudioContext}
        />,
      );
      await component.getByTestId('init-button').click();

      await expect(component.locator('audio[src]').nth(0)).toHaveAttribute(
        'src',
        `${AUDIO_FILE_URL}?1`,
      );

      await component.getByTestId('alternate-button').click();

      await expect(component.locator('audio[src]').nth(0)).toHaveAttribute(
        'src',
        `${AUDIO_FILE_URL}?3`,
      );
    });
  });
}

test.describe('with AudioContext', () => {
  commonTests({ forceSkipAudioContext: false });
});

test.describe('without AudioContext', () => {
  commonTests({ forceSkipAudioContext: true });
});
