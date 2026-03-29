import { useLoaderData, useParams } from '@remix-run/react';
import type { FC } from 'react';
import { Helmet } from 'react-helmet-async';

import { AudioController } from '../components/AudioController';
import { ShowEnded } from '../components/ShowEnded';
import { ShowIntro } from '../components/ShowIntro';
import { ShowPlaying } from '../components/ShowPlaying';
import { useShowInfo } from '../hooks/useShowInfo';
import elevationCssHref from '../styles/elevation.css?url';
import showCssHref from '../styles/show.css?url';
import type { loader as showDataLoader } from './$show.[data.json]';

export { loader } from './$show.[data.json]';

const Show: FC = () => {
  const loaderData = useLoaderData<typeof showDataLoader>();

  const { show } = useParams();

  const { targetShowInfo, onLoadedMetadata } = useShowInfo(loaderData);

  return (
    <>
      <Helmet>
        <title>{loaderData.name} | Festival</title>
        <meta name="description" content={loaderData.description} />
        <link rel="stylesheet" href={elevationCssHref} />
        <link rel="stylesheet" href={showCssHref} />
        <link rel="stylesheet" href={`/${show!}/styles.css`} />
      </Helmet>
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
    </>
  );
};

export default Show;
