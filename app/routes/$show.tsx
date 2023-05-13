import type { LinksFunction, MetaFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
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

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: elevationStylesUrl },
  { rel: 'stylesheet', href: showStylesUrl },
  ...introLinks(),
  ...playingLinks(),
  ...endedLinks(),
];

export { loader } from './$show.info';

export const meta: MetaFunction = ({ data }: { data: ShowData }) => {
  return {
    title: `${data.name} | Festival`,
    description: data.description,
  };
};

const Show: FC = () => {
  const loaderData: ShowData = useLoaderData();

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