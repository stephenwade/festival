import type { LinksFunction } from '@remix-run/node';
import type { FC } from 'react';

import { links as spinnerLinks } from '~/components/Spinner';
import { links as volumeLinks, VolumeFab } from '~/components/VolumeFab';
import stylesUrl from '~/styles/show-playing.css';
import type { AudioStatus } from '~/types/AudioStatus';
import type { ShowInfo } from '~/types/ShowInfo';

import { CurrentTime } from './CurrentTime';

export const links: LinksFunction = () => [
  ...spinnerLinks(),
  ...volumeLinks(),
  { rel: 'stylesheet', href: stylesUrl },
];

type Props = {
  volume: number;
  audioStatus: AudioStatus;
  showInfo: ShowInfo;

  onVolumeInput: (volume: number) => void;
};

export const ShowPlaying: FC<Props> = ({
  volume,
  audioStatus,
  showInfo,

  onVolumeInput,
}) => {
  const waitingUntilStart = showInfo.status === 'WAITING_UNTIL_START';

  return (
    <div className="playing-container full-page">
      <canvas className="canvas full-page"></canvas>
      <CurrentTime showInfo={showInfo} audioStatus={audioStatus} />
      {waitingUntilStart && <div className="next-up">Next up</div>}
      <div className="artist">{showInfo.currentSet?.artist}</div>
      <VolumeFab volume={volume} onVolumeInput={onVolumeInput} />
    </div>
  );
};
