import type { LinksFunction, MetaFunction } from '@remix-run/node';
import type { FC } from 'react';
import { useState } from 'react';

import { links as endedLinks, ShowEnded } from '~/components/ShowEnded';
import { links as introLinks, ShowIntro } from '~/components/ShowIntro';
import { links as playingLinks, ShowPlaying } from '~/components/ShowPlaying';
import showStylesUrl from '~/styles/show.css';
import type { ShowData } from '~/types/ShowData';

import { loader as showInfoLoader } from './$show.info';

export const links: LinksFunction = () => [
  ...introLinks(),
  ...playingLinks(),
  ...endedLinks(),
  { rel: 'stylesheet', href: showStylesUrl },
];

export const loader = showInfoLoader;

export const meta: MetaFunction = ({ data }: { data: ShowData }) => {
  return {
    title: `${data.name} | Festival`,
    description: data.description,
  };
};

enum ShowStatus {
  Intro,
  Playing,
  Ended,
}

const Show: FC = () => {
  const [showStatus, setShowStatus] = useState(ShowStatus.Intro);

  if (showStatus === ShowStatus.Intro) {
    return (
      <ShowIntro
        onListenClicked={() => {
          setShowStatus(ShowStatus.Playing);
        }}
      />
    );
  }

  if (showStatus === ShowStatus.Playing) {
    return (
      <ShowPlaying
        onShowEnded={() => {
          setShowStatus(ShowStatus.Ended);
        }}
      />
    );
  }

  return <ShowEnded />;
};

export default Show;
