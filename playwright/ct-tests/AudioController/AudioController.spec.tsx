/* eslint-disable playwright/no-wait-for-timeout */

import { expect as baseExpect, test } from '@playwright/experimental-ct-react';
import type { Locator } from '@playwright/test';

import { AudioControllerTest } from './AudioControllerTest';
import { AUDIO_FILE_LENGTH, AUDIO_FILE_URL, ID_1 } from './shared-data';

test.describe.configure({ retries: 5 });

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
  ).toBeTruthy();
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
  ).toBeTruthy();
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

      await expect(component.locator('audio[src]')).toHaveAttribute(
        'src',
        `${AUDIO_FILE_URL}?1`,
      );

      await component.getByTestId('alternate-button').click();

      await expect(component.locator('audio[src]')).toHaveAttribute(
        'src',
        `${AUDIO_FILE_URL}?3`,
      );
    });
  });

  test.describe('during the show', () => {
    test('starts audio at the correct time if initialized during the show', async ({
      mount,
      page,
    }) => {
      const component = await mount(
        <AudioControllerTest
          offsetSec={5}
          forceSkipAudioContext={forceSkipAudioContext}
        />,
      );
      await component.getByTestId('init-button').click();

      await page.waitForTimeout(400);
      await expectAudioIsPlaying(component);
      await expect(component).toContainText('Show status: PLAYING');
      await expectAudioCurrentTimeToAlmostEqual(component, 5.4);
    });

    test('preloads the next set 60 seconds before the end of the first set', async ({
      mount,
      page,
    }) => {
      const component = await mount(
        <AudioControllerTest
          offsetSec={AUDIO_FILE_LENGTH - 62}
          forceSkipAudioContext={forceSkipAudioContext}
        />,
      );
      await component.getByTestId('init-button').click();

      await page.waitForTimeout(400);
      await expect(
        component.locator('audio').nth(1),
        '62 seconds before the end of the first set',
      ).not.toHaveAttribute('src');
      await page.waitForTimeout(1000);
      await expect(
        component.locator('audio').nth(1),
        '61 seconds before the end of the first set',
      ).not.toHaveAttribute('src');
      await page.waitForTimeout(1000);
      await expect(
        component.locator('audio').nth(1),
        '61 seconds before the end of the first set',
      ).toHaveAttribute('src', `${AUDIO_FILE_URL}?2`);
    });

    test('does not update src if set info is changed', async ({
      mount,
      page,
    }) => {
      const component = await mount(
        <AudioControllerTest
          offsetSec={AUDIO_FILE_LENGTH - 10}
          forceSkipAudioContext={forceSkipAudioContext}
        />,
      );
      await component.getByTestId('init-button').click();

      await expect(
        component.locator('audio').nth(0),
        '10 seconds before the end of the first set',
      ).toHaveAttribute('src', /\?1(#t=\d+)?$/u);

      await component.getByTestId('alternate-button').click();

      await page.waitForTimeout(1000);
      await expect(
        component.locator('audio').nth(0),
        '9 seconds before the end of the first set',
      ).toHaveAttribute('src', /\?1(#t=\d+)?$/u);
    });
  });

  test.describe('after the show', () => {
    test('sets the show status', async ({ mount }) => {
      const component = await mount(
        <AudioControllerTest
          offsetSec={AUDIO_FILE_LENGTH * 3}
          forceSkipAudioContext={forceSkipAudioContext}
        />,
      );
      await component.getByTestId('init-button').click();

      await expect(component).toContainText('Show status: ENDED');
    });
  });

  test.describe('empty show', () => {
    test('sets the show status to ENDED', async ({ mount }) => {
      const component = await mount(
        <AudioControllerTest
          empty
          forceSkipAudioContext={forceSkipAudioContext}
        />,
      );
      await component.getByTestId('init-button').click();

      await expect(component).toContainText('Show status: ENDED');
    });
  });
}

test.describe('with AudioContext', () => {
  const forceSkipAudioContext = false;

  commonTests({ forceSkipAudioContext });

  test.describe('init with AudioContext', () => {
    test('visualizer data is available', async ({ mount }) => {
      const component = await mount(
        <AudioControllerTest
          offsetSec={-5}
          forceSkipAudioContext={forceSkipAudioContext}
        />,
      );
      await component.getByTestId('init-button').click();

      await expect(component).toContainText('Visualizer data is available');
    });
  });
});

test.describe('without AudioContext', () => {
  const forceSkipAudioContext = true;

  commonTests({ forceSkipAudioContext });

  test.describe('init without AudioContext', () => {
    test('visualizer data is not available', async ({ mount, page }) => {
      const component = await mount(
        <AudioControllerTest
          empty
          forceSkipAudioContext={forceSkipAudioContext}
        />,
      );
      await component.getByTestId('init-button').click();

      await page.waitForTimeout(1000);
      await expect(component).toContainText('Visualizer data is not available');
    });
  });
});
