import type { LinksFunction } from '@remix-run/node';
import type { FC } from 'react';
import { useState } from 'react';

import { links as spinnerLinks, Spinner } from '~/components/Spinner';
import { links as volumeLinks, VolumeFab } from '~/components/VolumeFab';
import stylesUrl from '~/styles/show-playing.css';

export const links: LinksFunction = () => [
  ...spinnerLinks(),
  ...volumeLinks(),
  { rel: 'stylesheet', href: stylesUrl },
];

type Props = {
  onVolumeInput: (volume: number) => void;
};

export const ShowPlaying: FC<Props> = ({ onVolumeInput }) => {
  const [showSpinner, setShowSpinner] = useState(true);
  const [waitingUntilStart] = useState(true);
  const volume = 100;
  const set = { artist: "'Etikit" };

  const currentTime = '0:05';

  return (
    <div className="playing-container full-page">
      <canvas className="canvas full-page"></canvas>
      <div
        className="current-time"
        onClick={() => {
          setShowSpinner((showSpinner) => !showSpinner);
        }}
      >
        {showSpinner ? <Spinner /> : currentTime}
      </div>
      {waitingUntilStart ? <div className="next-up">Next up</div> : null}
      <div className="artist">{set.artist}</div>
      <VolumeFab volume={volume} onVolumeInput={onVolumeInput} />
    </div>
  );
};
