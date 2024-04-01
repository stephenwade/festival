import '~/styles/elevation.css';
import '~/styles/show.css';

import type { LoaderFunction, MetaFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { addSeconds, formatISO } from 'date-fns';
import type { FC } from 'react';
import useLocalStorageState from 'use-local-storage-state';

import { AudioController } from '~/components/AudioController';
import { ShowEnded } from '~/components/ShowEnded';
import { ShowIntro } from '~/components/ShowIntro';
import { ShowPlaying } from '~/components/ShowPlaying';
import { db } from '~/db/db.server';
import { useShowInfo } from '~/hooks/useShowInfo';
import type { ShowData } from '~/types/ShowData';

export const meta: MetaFunction<typeof loader> = ({ data, params }) => {
  const id = params.show!;

  return [
    { title: data ? `${data.name} | Festival` : 'Festival' },
    { name: 'description', content: data?.description },
    { tagName: 'link', rel: 'stylesheet', href: `/${id}/styles.css` },
  ];
};

export const loader = (async ({ params }) => {
  const id = params.show!;

  const show = await db.show.findUnique({
    where: { id },
    include: {
      showLogoFile: true,
      backgroundImageFile: true,
      sets: {
        include: {
          audioFileUpload: { select: { audioFile: true } },
        },
        orderBy: { offset: 'asc' },
      },
    },
  });
  if (!show) throw redirect('/');

  const data: ShowData = {
    name: show.name,
    description: show.description,
    showLogoUrl: show.showLogoFile.url,
    backgroundImageUrl: show.backgroundImageFile.url,
    sets: show.sets.map((set) => ({
      id: set.id,
      audioUrl: set.audioFileUpload?.audioFile?.audioUrl ?? '',
      artist: set.artist,
      start: addSeconds(show.startDate, set.offset).toISOString(),
      duration: set.audioFileUpload?.audioFile?.duration ?? 0,
    })),
    serverDate: formatISO(new Date()),
  };

  return json(data);
}) satisfies LoaderFunction;

const Show: FC = () => {
  const loaderData = useLoaderData<typeof loader>();

  const { targetShowInfo, onLoadedMetadata } = useShowInfo(loaderData);

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
