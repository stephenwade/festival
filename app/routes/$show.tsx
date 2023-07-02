import type {
  LinksFunction,
  LoaderFunction,
  V2_MetaFunction,
} from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { formatISO } from 'date-fns';
import type { FC } from 'react';
import useLocalStorageState from 'use-local-storage-state';

import { AudioController } from '~/components/AudioController';
import { links as endedLinks, ShowEnded } from '~/components/ShowEnded';
import { links as introLinks, ShowIntro } from '~/components/ShowIntro';
import { links as playingLinks, ShowPlaying } from '~/components/ShowPlaying';
import { useShowInfo } from '~/hooks/useShowInfo';
import elevationStylesUrl from '~/styles/elevation.css';
import showStylesUrl from '~/styles/show.css';
import type { ShowData } from '~/types/ShowData';

export const meta: V2_MetaFunction<typeof loader> = ({ data, params }) => {
  const id = params.show as string;

  return [
    { title: data ? `${data.name} | Festival` : 'Festival' },
    { name: 'description', content: data?.description },
    { tagName: 'link', rel: 'stylesheet', href: `/${id}/styles.css` },
  ];
};

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: elevationStylesUrl },
  { rel: 'stylesheet', href: showStylesUrl },
  ...introLinks(),
  ...playingLinks(),
  ...endedLinks(),
];

export const loader = (() => {
  const data: ShowData = {
    name: 'Sample Show',
    description: 'November 8–15, 2023',
    sets: [
      {
        id: 'd4cf8bbe-79ab-4cd8-a319-0ea391f38413',
        audioUrl: '/media/sample/energy-fix.mp3',
        artist: 'Computer Music All‑stars',
        start: '2023-06-25T20:00:00-0400',
        duration: 181.34,
      },
      {
        id: '53d233eb-8326-4767-995b-10759bb2bd6f',
        audioUrl: '/media/sample/bust-this-bust-that.mp3',
        artist: 'Professor Kliq',
        start: '2023-06-25T20:03:06-0400',
        duration: 268.64,
      },
      {
        id: '4b4c209f-c26e-4a6e-a2e3-e3c88c6c0958',
        audioUrl: '/media/sample/one-ride.mp3',
        artist: "'Etikit",
        start: '2023-06-25T20:07:40-0400',
        duration: 183.72,
      },
      {
        id: 'c88d9242-7be4-499c-abe9-ba4f62063ba9',
        audioUrl: '/media/sample/total-breakdown.mp3',
        artist: 'Brad Sucks',
        start: '2023-06-25T20:10:49-0400',
        duration: 139,
      },
      {
        id: '0b2c85e8-9614-471a-a645-b5f44c657c1c',
        audioUrl: '/media/sample/distant-thunder-sunday-morning.mp3',
        artist: 'springtide',
        start: '2023-06-25T20:13:13-0400',
        duration: 226.06,
      },
    ],
    serverDate: formatISO(new Date()),
  };

  return json(data);
}) satisfies LoaderFunction;

const Show: FC = () => {
  const loaderData = useLoaderData<typeof loader>();

  const { targetShowInfo, onLoadedMetadata } = useShowInfo({ loaderData });

  const [volume, setVolume] = useLocalStorageState('volume', {
    defaultValue: 100,
    storageSync: false,
  });

  return (
    <AudioController
      targetShowInfo={targetShowInfo}
      volume={volume}
      onLoadedMetadata={onLoadedMetadata}
    >
      {({
        showInfo,
        audioStatus,
        audioError,

        initializeAudio,
        getAudioVisualizerData,
      }) => {
        if (showInfo.status === 'WAITING_FOR_AUDIO_CONTEXT') {
          return (
            <ShowIntro
              onListenClicked={() => {
                void initializeAudio();
              }}
            />
          );
        }

        if (showInfo.status === 'ENDED') {
          return <ShowEnded />;
        }

        return (
          <ShowPlaying
            volume={volume}
            audioStatus={audioStatus}
            audioError={audioError}
            showInfo={showInfo}
            getAudioVisualizerData={getAudioVisualizerData}
            onVolumeInput={setVolume}
          />
        );
      }}
    </AudioController>
  );
};

export default Show;
