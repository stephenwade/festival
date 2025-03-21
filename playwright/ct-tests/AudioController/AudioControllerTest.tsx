import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { createRemixStub } from '@remix-run/testing';
import type { FC } from 'react';
import { useState } from 'react';
import { Temporal } from 'temporal-polyfill';
import { useDeepCompareMemo } from 'use-deep-compare';

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
}: GetMockDataProps): Pick<ShowData, 'slug' | 'serverDate' | 'sets'> {
  const now = Temporal.Now.instant();

  const sets: ShowData['sets'] = empty
    ? []
    : [
        {
          id: alternate ? ID_3 : ID_1,
          audioUrl: `${AUDIO_FILE_URL}?${alternate ? 3 : 1}`,
          artist: `Artist ${alternate ? 3 : 1}`,
          start: now.add({ seconds: 0 - offsetSec }).toString(),
          duration: AUDIO_FILE_LENGTH,
        },
        {
          id: alternate ? ID_4 : ID_2,
          audioUrl: `${AUDIO_FILE_URL}?${alternate ? 4 : 2}`,
          artist: `Artist ${alternate ? 4 : 2}`,
          start: now.add({ seconds: 100 - offsetSec }).toString(),
          duration: AUDIO_FILE_LENGTH,
        },
      ];

  return {
    slug: 'test',
    serverDate: now.toString(),
    sets,
  };
}

interface TestProps extends Omit<GetMockDataProps, 'alternate'> {
  forceSkipAudioContext: boolean;
}

function AudioControllerDisplay() {
  const { forceSkipAudioContext, ...props } = useLoaderData<TestProps>();

  const [alternate, setAlternate] = useState(false);

  const data = useDeepCompareMemo(
    () => getMockData({ ...props, alternate }),
    [alternate, props],
  );
  const { targetShowInfo } = useShowInfo(data, { ci: true });

  const [metadatas, setMetadatas] = useState<AudioMetadata[]>([]);
  function onLoadedMetadata(metadata: AudioMetadata) {
    setMetadatas((prev) => [...prev, metadata]);
  }

  return (
    <AudioController
      targetShowInfo={targetShowInfo}
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
        // Single Fetch doesn't work with Clerk
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return json(props);
      },
    },
  ]);

  return <RemixStub />;
};
