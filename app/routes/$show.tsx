import '~/styles/elevation.css';
import '~/styles/show.css';

import type { MetaFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import type { FC } from 'react';

import { AudioController } from '~/components/AudioController';
import { ShowEnded } from '~/components/ShowEnded';
import { ShowIntro } from '~/components/ShowIntro';
import { ShowPlaying } from '~/components/ShowPlaying';
import { useShowInfo } from '~/hooks/useShowInfo';

import { loader as showDataLoader } from './$show.[data.json]';

export const meta: MetaFunction<typeof loader> = ({ data, params }) => {
  const slug = params.show!;

  return [
    { title: data ? `${data.name} | Festival` : 'Festival' },
    { name: 'description', content: data?.description },
    { tagName: 'link', rel: 'stylesheet', href: `/${slug}/styles.css` },
  ];
};

export const loader = showDataLoader;

const Show: FC = () => {
  const loaderData = useLoaderData<typeof showDataLoader>();

  const { targetShowInfo, onLoadedMetadata } = useShowInfo(loaderData);

  return (
    <AudioController
      targetShowInfo={targetShowInfo}
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
              logoUrl={loaderData.showLogoUrl}
              onListenClicked={() => {
                void initializeAudio();
              }}
            />
          );
        }

        if (showInfo.status === 'ENDED') {
          return <ShowEnded logoUrl={loaderData.showLogoUrl} />;
        }

        // showInfo.status: "WAITING_UNTIL_START" | "PLAYING"
        return (
          <ShowPlaying
            audioStatus={audioStatus}
            audioError={audioError}
            showInfo={showInfo}
            getAudioVisualizerData={getAudioVisualizerData}
          />
        );
      }}
    </AudioController>
  );
};

export default Show;
