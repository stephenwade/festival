import { addSeconds } from 'date-fns';
import type { FC } from 'react';

import type { ShowPlayingProps } from '~/components/ShowPlaying';
import { ShowPlaying } from '~/components/ShowPlaying';
import { initialAudioStatus } from '~/types/AudioStatus';

type TestProps =
  | { status: 'WAITING_UNTIL_START'; secondsUntilSet: number }
  | { status: 'PLAYING'; currentTime: number };

const sharedProps = {
  volume: 35,
  audioStatus: initialAudioStatus,
  audioError: false,
  getAudioVisualizerData: null,
  onVolumeInput: () => void 0,
} satisfies Partial<ShowPlayingProps>;

export const ShowPlayingTest: FC<TestProps> = (props) => {
  const { status } = props;

  if (status === 'WAITING_UNTIL_START') {
    const { secondsUntilSet } = props;

    return (
      <ShowPlaying
        {...sharedProps}
        showInfo={{
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
        }}
      />
    );
  }

  // status === 'PLAYING'
  const { currentTime } = props;

  return (
    <ShowPlaying
      {...sharedProps}
      showInfo={{
        status: 'PLAYING',
        currentTime,
        currentSet: {
          id: '69859842-c6ac-3aa4-8f0d-358ff7758b9e',
          audioUrl: 'sample/dana.mp3',
          artist: 'Dana',
          start: addSeconds(Date.now(), -currentTime),
          end: addSeconds(Date.now(), 30 - currentTime),
          duration: 30,
        },
      }}
    />
  );
};
