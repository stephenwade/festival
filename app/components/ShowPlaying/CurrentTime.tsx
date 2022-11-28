import type { FC } from 'react';
import { useMemo } from 'react';

import type { AudioStatus } from '~/types/AudioStatus';
import type { ShowInfo } from '~/types/ShowInfo';

import { Spinner } from '../Spinner';

type Props = {
  showInfo: ShowInfo;
  audioStatus: AudioStatus;
};

export const CurrentTime: FC<Props> = ({ showInfo, audioStatus }) => {
  const waitingUntilStart = showInfo.status === 'WAITING_UNTIL_START';
  const playing = showInfo.status === 'PLAYING';
  const waitingForNetwork = audioStatus.waiting;

  const showSpinner = waitingUntilStart ? false : waitingForNetwork;

  const currentTime = useMemo(() => {
    let time: number | undefined;
    if (waitingUntilStart) {
      time = showInfo.secondsUntilSet;
    } else if (playing) {
      time = Math.floor(showInfo.currentTime + 0.1);
    }

    if (time === undefined) {
      return undefined;
    }

    const hours = Math.floor(time / (60 * 60));
    const minutesFrac = time % (60 * 60);

    const minutes = Math.floor(minutesFrac / 60);
    const seconds = time % 60;

    let result =
      hours > 0
        ? `${hours.toString()}:${minutes.toString().padStart(2, '0')}`
        : minutes.toString();
    result += `:${seconds.toString().padStart(2, '0')}`;
    return result;
  }, [playing, showInfo, waitingUntilStart]);

  return (
    <div className="current-time">
      {showSpinner || !currentTime ? <Spinner /> : currentTime}
    </div>
  );
};
