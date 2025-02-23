import { expect, test } from '@playwright/experimental-ct-react';
import { Temporal } from 'temporal-polyfill';

import type { ShowPlayingProps } from '~/components/ShowPlaying';
import { ShowPlaying } from '~/components/ShowPlaying';
import { initialAudioStatus } from '~/types/AudioStatus';
import type { ShowInfo } from '~/types/ShowInfo';

function makeShowInfoWaitingUntilStart(secondsUntilSet: number) {
  return {
    status: 'WAITING_UNTIL_START',
    secondsUntilSet,
    currentSet: {
      id: 'e465d3cf-7875-3fd9-915c-91a915bb8187',
      audioUrl: 'sample/fulton.mp3',
      artist: 'Fulton',
      start: Temporal.Now.instant().add({ seconds: secondsUntilSet }),
      end: Temporal.Now.instant().add({ seconds: secondsUntilSet + 30 }),
      duration: 30,
    },
  } satisfies ShowInfo;
}

function makeShowInfoPlaying(currentTime: number) {
  return {
    status: 'PLAYING',
    currentTime,
    currentSet: {
      id: '69859842-c6ac-3aa4-8f0d-358ff7758b9e',
      audioUrl: 'sample/dana.mp3',
      artist: 'Dana',
      start: Temporal.Now.instant().add({ seconds: -currentTime }),
      end: Temporal.Now.instant().add({ seconds: 30 - currentTime }),
      duration: 30,
    },
  } satisfies ShowInfo;
}

function showPlayingTemplate(
  props: Partial<ShowPlayingProps> & Pick<ShowPlayingProps, 'showInfo'>,
) {
  return (
    <ShowPlaying
      audioStatus={initialAudioStatus}
      audioError={false}
      getAudioVisualizerData={null}
      {...props}
    />
  );
}

test.describe('while waiting for start', () => {
  const showInfo = makeShowInfoWaitingUntilStart(10);

  test('includes the words "NEXT UP"', async ({ mount }) => {
    const component = await mount(showPlayingTemplate({ showInfo }));

    await expect(component).toContainText('NEXT UP');
  });

  test('includes the artist name', async ({ mount }) => {
    const component = await mount(showPlayingTemplate({ showInfo }));

    await expect(component).toContainText('Fulton');
  });

  test('includes minutes and seconds', async ({ mount }) => {
    const component = await mount(
      showPlayingTemplate({ showInfo: makeShowInfoWaitingUntilStart(165) }),
    );

    await expect(component).toContainText('2:45');
    await expect(component).not.toContainText('02:45');
  });

  test('includes hours if there is an hour or more until the set', async ({
    mount,
  }) => {
    const component = await mount(
      showPlayingTemplate({
        showInfo: makeShowInfoWaitingUntilStart(165 + 3600),
      }),
    );

    await expect(component).toContainText('1:02:45');
    await expect(component).not.toContainText('01:02:45');
  });
});

test.describe('while playing', () => {
  const showInfo = makeShowInfoPlaying(15);

  test('does not include the words "NEXT UP"', async ({ mount }) => {
    const component = await mount(showPlayingTemplate({ showInfo }));

    await expect(component).not.toContainText('NEXT UP');
  });

  test('includes the artist name', async ({ mount }) => {
    const component = await mount(showPlayingTemplate({ showInfo }));

    await expect(component).toContainText('Dana');
  });

  test('includes minutes and seconds', async ({ mount }) => {
    const component = await mount(
      showPlayingTemplate({ showInfo: makeShowInfoPlaying(295) }),
    );

    await expect(component).toContainText('4:55');
    await expect(component).not.toContainText('04:55');
  });

  test('includes hours if the current time is more than an hour', async ({
    mount,
  }) => {
    const component = await mount(
      showPlayingTemplate({
        showInfo: makeShowInfoPlaying(295 + 3600),
      }),
    );

    await expect(component).toContainText('1:04:55');
    await expect(component).not.toContainText('01:04:55');
  });

  test('includes a canvas', async ({ mount }) => {
    const component = await mount(
      showPlayingTemplate({ showInfo: makeShowInfoPlaying(295) }),
    );

    await expect(component.locator('canvas')).toBeVisible();
  });
});
