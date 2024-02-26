import type { FC } from 'react';
import { useState } from 'react';

import { AudioCanvas } from '~/components/ShowPlaying/AudioCanvas';

function hashCode(array: Iterable<number>): number {
  let hash = 0;
  for (const item of array) {
    hash = (hash << 5) - hash + item;
  }
  return hash;
}

interface TestProps {
  forceReduceMotion: boolean;
}

export const AudioCanvasTest: FC<TestProps> = ({ forceReduceMotion }) => {
  const [withAudioData, setWithAudioData] = useState(false);
  const [snapshot1Hash, setSnapshot1Hash] = useState<number | null>(null);
  const [snapshot2Hash, setSnapshot2Hash] = useState<number | null>(null);

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
      <AudioCanvas
        currentTime={7}
        setLength={30}
        progressLineFrozen
        forceReduceMotion={forceReduceMotion}
        getAudioVisualizerData={
          withAudioData
            ? () =>
                Uint8Array.from(Array.from<number>({ length: 512 }).fill(100))
            : () => Uint8Array.from(Array.from<number>({ length: 512 }).fill(0))
        }
      />
    </>
  );
};
