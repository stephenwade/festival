import { expect, test } from '@playwright/experimental-ct-react';

import { AudioControllerTest } from './AudioControllerTest';

function commonTests(template: JSX.Element) {
  test('renders two audio elements', async ({ mount }) => {
    const component = await mount(template);

    const audios = await component.locator('audio').all();
    expect(audios).toHaveLength(2);

    for (const audio of audios) {
      await expect(audio).toHaveAttribute('crossorigin', 'anonymous');
    }
  });

  test('calling initializeAudio() sets the show status', async ({ mount }) => {
    const component = await mount(template);

    await expect(component).toContainText(
      'Show status: WAITING_FOR_AUDIO_CONTEXT',
    );

    await component.getByTestId('init-button').click();

    await expect(component).toContainText('Show status: WAITING_UNTIL_START');
  });
}

test.describe('with AudioContext', () => {
  const template = <AudioControllerTest />;

  commonTests(template);
});

test.describe('without AudioContext', () => {
  const template = <AudioControllerTest forceSkipAudioContext />;

  commonTests(template);
});
