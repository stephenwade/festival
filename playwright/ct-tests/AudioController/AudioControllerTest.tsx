import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { createRemixStub } from '@remix-run/testing';
import { addSeconds } from 'date-fns';
import type { FC } from 'react';
import { useState } from 'react';

import type { AudioMetadata } from '~/components/AudioController';
import { AudioController } from '~/components/AudioController';
import { useShowInfo } from '~/hooks/useShowInfo';
import type { ShowData } from '~/types/ShowData';

import {
  AUDIO_FILE_LENGTH,
  AUDIO_FILE_URL,
  ID_1,
  ID_2,
  ID_3,
  ID_4,
} from './shared-data';

interface GetMockDataProps {
  offsetSec?: number;
  alternate?: boolean;
  empty?: boolean;
}

function getMockData({
  offsetSec = 0,
  alternate = false,
  empty = false,
}: GetMockDataProps): Pick<ShowData, 'serverDate' | 'sets'> {
  const now = new Date();

  const sets: ShowData['sets'] = empty
    ? []
    : [
        {
          id: alternate ? ID_3 : ID_1,
          audioUrl: `${AUDIO_FILE_URL}?${alternate ? 3 : 1}`,
          artist: `Artist ${alternate ? 3 : 1}`,
          start: addSeconds(now, 0 - offsetSec).toISOString(),
          duration: AUDIO_FILE_LENGTH,
        },
        {
          id: alternate ? ID_4 : ID_2,
          audioUrl: `${AUDIO_FILE_URL}?${alternate ? 4 : 2}`,
          artist: `Artist ${alternate ? 4 : 2}`,
          start: addSeconds(now, 100 - offsetSec).toISOString(),
          duration: AUDIO_FILE_LENGTH,
        },
      ];

  return {
    serverDate: now.toISOString(),
    sets,
  };
}

interface TestProps extends Omit<GetMockDataProps, 'alternate'> {
  forceSkipAudioContext: boolean;
}

function AudioControllerDisplay() {
  const { forceSkipAudioContext, ...props } = useLoaderData<TestProps>();

  const [alternate, setAlternate] = useState(false);

  const data = getMockData({ ...props, alternate });
  const { targetShowInfo } = useShowInfo(data, { ci: true });

  const [metadatas, setMetadatas] = useState<AudioMetadata[]>([]);
  function onLoadedMetadata(metadata: AudioMetadata) {
    setMetadatas((prev) => [...prev, metadata]);
  }

  return (
    <AudioController
      targetShowInfo={targetShowInfo}
      volume={42}
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
  const RemixStub = createRemixStub([
    {
      path: '/',
      Component: AudioControllerDisplay,
      loader() {
        return json(props);
      },
    },
  ]);

  return <RemixStub />;
};
