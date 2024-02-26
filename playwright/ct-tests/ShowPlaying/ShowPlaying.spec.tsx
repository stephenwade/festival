import { expect, test } from '@playwright/experimental-ct-react';
import { addSeconds } from 'date-fns';

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
      start: addSeconds(Date.now(), secondsUntilSet),
      end: addSeconds(Date.now(), secondsUntilSet + 30),
      duration: 30,
    },
  } satisfies ShowInfo;
}

function showPlayingTemplate(
  props: Partial<ShowPlayingProps> & Pick<ShowPlayingProps, 'showInfo'>,
) {
  return (
    <ShowPlaying
      volume={35}
      audioStatus={initialAudioStatus}
      audioError={false}
      getAudioVisualizerData={null}
      onVolumeInput={() => void 0}
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
    await expect(component).not.toContainText('0:02:45');
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
