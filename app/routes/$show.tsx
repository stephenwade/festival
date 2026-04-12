import { useParams } from '@remix-run/react';
import { useQueries } from '@tanstack/react-query';
import type { FC } from 'react';
import { Helmet } from 'react-helmet-async';

import { AudioController } from '../components/AudioController';
import { ShowEnded } from '../components/ShowEnded';
import { ShowIntro } from '../components/ShowIntro';
import { ShowPlaying } from '../components/ShowPlaying';
import { useShowInfo } from '../hooks/useShowInfo';
import elevationCssHref from '../styles/elevation.css?url';
import showCssHref from '../styles/show.css?url';
import { useTRPC } from '../trpc.tsx';

const Show: FC = () => {
  const show = useParams().show!;

  const trpc = useTRPC();

  const [{ error, data: showData }, { data: showStyles }] = useQueries({
    queries: [
      trpc.show.getShowData.queryOptions({ slug: show }),
      trpc.show.getShowStyles.queryOptions({ slug: show }),
    ],
  });

  const { targetShowInfo, onLoadedMetadata } = useShowInfo(show);

  if (error?.data?.code === 'NOT_FOUND') {
    return <h1>Not Found</h1>;
  }

  return (
    <>
      <Helmet>
        {showData ? <title>{showData.name} | Festival</title> : null}
        {showData ? (
          <meta name="description" content={showData.description} />
        ) : null}
        <link rel="stylesheet" href={elevationCssHref} />
        <link rel="stylesheet" href={showCssHref} />
        {showStyles ? <style>{showStyles}</style> : null}
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
          if (!showData) return null;

          if (showInfo.status === 'WAITING_FOR_AUDIO_CONTEXT') {
            return (
              <ShowIntro
                logoUrl={showData.showLogoUrl}
                onListenClicked={() => {
                  void initializeAudio();
                }}
              />
            );
          }

          if (showInfo.status === 'ENDED') {
            return <ShowEnded logoUrl={showData.showLogoUrl} />;
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
