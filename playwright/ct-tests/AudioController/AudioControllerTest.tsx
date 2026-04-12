import type { FC } from 'react';
import { useMemo, useState } from 'react';

import type { AudioMetadata } from '../../../app/components/AudioController';
import { AudioController } from '../../../app/components/AudioController';
import { useShowInfo } from '../../../app/hooks/useShowInfo';
import { MockedTRPCProvider } from '../trpc';

interface TestProps {
  forceSkipAudioContext: boolean;
}

function AudioControllerDisplay({ forceSkipAudioContext }: TestProps) {
  const [alternate, setAlternate] = useState(false);

  const { targetShowInfo } = useShowInfo('', { ci: true });
  const targetShowInfoWithAlternate = useMemo(() => {
    const result = structuredClone(targetShowInfo);

    if (alternate) {
      if (result.currentSet) {
        result.currentSet.id += ' alternate';
        result.currentSet.audioUrl! += '?alternate';
        result.currentSet.artist += ' alternate';
      }

      if (result.nextSet) {
        result.nextSet.id += ' alternate';
        result.nextSet.audioUrl! += '?alternate';
        result.nextSet.artist += ' alternate';
      }
    }

    return result;
  }, [targetShowInfo, alternate]);

  const [metadatas, setMetadatas] = useState<AudioMetadata[]>([]);
  function onLoadedMetadata(metadata: AudioMetadata) {
    setMetadatas((prev) => [...prev, metadata]);
  }

  return (
    <AudioController
      targetShowInfo={targetShowInfoWithAlternate}
      onLoadedMetadata={onLoadedMetadata}
      forceSkipAudioContext={forceSkipAudioContext}
    >
      {({ showInfo, initializeAudio, getAudioVisualizerData }) => (
        <div>
          <p>
            <button
              data-testid="init-button"
              onClick={() => {
                void initializeAudio();
              }}
            >
              Initialize audio
            </button>
          </p>
          <p>
            {alternate ? (
              'Using alternate data'
            ) : (
              <button
                data-testid="alternate-button"
                onClick={() => {
                  setAlternate(true);
                }}
              >
                Use alternate data
              </button>
            )}
          </p>
          <p>Show status: {showInfo.status}</p>
          <p>
            Metadata events:
            <ul>
              {metadatas.map((metadata, i) => (
                <li data-testid="metadata-event" key={i}>
                  <span data-testid="metadata-event-id">{metadata.id}</span>{' '}
                  <span data-testid="metadata-event-duration">
                    {metadata.duration}
                  </span>
                </li>
              ))}
            </ul>
          </p>
          <p>
            {getAudioVisualizerData
              ? 'Visualizer data is available'
              : 'Visualizer data is not available'}
          </p>
        </div>
      )}
    </AudioController>
  );
}

export const AudioControllerTest: FC<TestProps> = (props) => {
  return (
    <MockedTRPCProvider>
      <AudioControllerDisplay {...props} />
    </MockedTRPCProvider>
  );
};
