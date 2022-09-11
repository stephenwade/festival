import type { LinksFunction } from '@remix-run/node';
import type { FC } from 'react';
import { useState } from 'react';

import stylesUrl from '~/styles/show-playing.css';

import { links as volumeLinks, VolumeFab } from '../VolumeFab';

export const links: LinksFunction = () => [
  ...volumeLinks(),
  { rel: 'stylesheet', href: stylesUrl },
];

function LoadingSpinner() {
  return null;
}

type Props = {
  onShowEnded: () => void;
};

export const ShowPlaying: FC<Props> = ({ onShowEnded }) => {
  const [showSpinner] = useState(false);
  const [waitingUntilStart] = useState(true);
  const volume = 100;
  const set = { artist: "'Etikit" };

  const currentTime = '0:05';

  return (
    <div className="playing-container full-page">
      <canvas className="canvas full-page"></canvas>
      <div className="current-time" onClick={onShowEnded}>
        {showSpinner ? <LoadingSpinner /> : currentTime}
      </div>
      {waitingUntilStart ? <div className="next-up">Next up</div> : null}
      <div className="artist">{set.artist}</div>
      <VolumeFab
        volume={volume}
        // @volumeinput="${this._handleVolumeInput}"
      />
    </div>
  );
};
