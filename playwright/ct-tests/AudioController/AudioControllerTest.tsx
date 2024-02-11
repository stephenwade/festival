import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { createRemixStub } from '@remix-run/testing';
import { addSeconds } from 'date-fns';
import { useState } from 'react';

import type { AudioMetadata } from '~/components/AudioController';
import { AudioController } from '~/components/AudioController';
import { useShowInfo } from '~/hooks/useShowInfo';
import type { ShowData } from '~/types/ShowData';

const AUDIO_FILE_URL =
  'https://festivalci.z13.web.core.windows.net/60-sec-silence.mp3';
const AUDIO_FILE_LENGTH = 60;

const ID_1 = 'ccc19b72-4a68-3219-9409-ef1ef0d75643';
const ID_2 = 'cabd6f8c-17c9-3781-a8e8-82df3d644afb';
const ID_3 = '55672a19-ba5d-3974-9cc7-2e2f2b2c716f';
const ID_4 = '565a5b79-111e-3f89-8ccf-fa28acb8ad9b';

interface Props {
  offsetSec: number;
  alternate?: boolean;
  empty?: boolean;

  forceSkipAudioContext: boolean;
}

function getMockData({
  offsetSec,
  alternate = false,
  empty = false,

  forceSkipAudioContext,
}: Props): Pick<ShowData, 'serverDate' | 'sets'> & {
  forceSkipAudioContext?: boolean;
} {
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

    forceSkipAudioContext,
  };
}

function AudioControllerDisplay() {
  const { forceSkipAudioContext, ...data } =
    useLoaderData<ReturnType<typeof getMockData>>();
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
      {({
        showInfo,
        audioStatus,
        audioError,

        initializeAudio,
        getAudioVisualizerData,
      }) => (
        <div>
          <button
            data-testid="init-button"
            onClick={() => {
              void initializeAudio();
            }}
          >
            Initialize audio
          </button>
          <p>Show status: {showInfo.status}</p>
          <p>
            Metadata events:
            <ul>
              {metadatas.map((metadata, i) => (
                <li key={i}>
                  ID: {metadata.id}
                  <br />
                  Duration: {metadata.duration}
                </li>
              ))}
            </ul>
          </p>
        </div>
      )}
    </AudioController>
  );
}

export function AudioControllerTest(props: Props) {
  const RemixStub = createRemixStub([
    {
      path: '/',
      Component: AudioControllerDisplay,
      loader() {
        return json(getMockData(props));
      },
    },
  ]);

  return <RemixStub />;
}
