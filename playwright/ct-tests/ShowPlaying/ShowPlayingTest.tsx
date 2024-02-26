import { addSeconds } from 'date-fns';
import type { FC } from 'react';
import { useState } from 'react';

import type { ShowPlayingProps } from '~/components/ShowPlaying';
import { ShowPlaying } from '~/components/ShowPlaying';
import { initialAudioStatus } from '~/types/AudioStatus';

function hashCode(array: Iterable<number>): number {
  let hash = 0;
  for (const item of array) {
    hash = (hash << 5) - hash + item;
  }
  return hash;
}

type TestProps =
  | { status: 'WAITING_UNTIL_START'; secondsUntilSet: number }
  | { status: 'PLAYING'; currentTime: number; forceReduceMotion?: boolean };

const sharedProps = {
  volume: 35,
  audioStatus: { ...initialAudioStatus, paused: true },
  audioError: false,
  getAudioVisualizerData: null,
  onVolumeInput: () => void 0,
} satisfies Partial<ShowPlayingProps>;

export const ShowPlayingTest: FC<TestProps> = (props) => {
  const [withAudioData, setWithAudioData] = useState(false);
  const [snapshot1Hash, setSnapshot1Hash] = useState<number | null>(null);
  const [snapshot2Hash, setSnapshot2Hash] = useState<number | null>(null);

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
  const { currentTime, forceReduceMotion } = props;

  return (
    <>
      <p>
        <button
          onClick={() => {
            setWithAudioData((prev) => !prev);
          }}
        >
          {withAudioData ? 'Disable' : 'Enable'} canvas data
        </button>
      </p>
      <p>
        <button
          onClick={() => {
            const canvas = document.querySelector('canvas')!;
            setSnapshot1Hash(
              hashCode(
                canvas
                  .getContext('2d')!
                  .getImageData(0, 0, canvas.width, canvas.height).data,
              ),
            );
          }}
        >
          Take snapshot 1
        </button>
        {snapshot1Hash === null ? null : (
          <span data-testid="snapshot-1-hash">{snapshot1Hash}</span>
        )}
      </p>
      <p>
        <button
          onClick={() => {
            const canvas = document.querySelector('canvas')!;
            setSnapshot2Hash(
              hashCode(
                canvas
                  .getContext('2d')!
                  .getImageData(0, 0, canvas.width, canvas.height).data,
              ),
            );
          }}
        >
          Take snapshot 2
        </button>
        {snapshot2Hash === null ? null : (
          <span data-testid="snapshot-2-hash">{snapshot2Hash}</span>
        )}
      </p>
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
        getAudioVisualizerData={
          withAudioData
            ? () =>
                Uint8Array.from(Array.from<number>({ length: 512 }).fill(100))
            : () => Uint8Array.from(Array.from<number>({ length: 512 }).fill(0))
        }
        forceReduceMotion={forceReduceMotion}
      />
    </>
  );
};
