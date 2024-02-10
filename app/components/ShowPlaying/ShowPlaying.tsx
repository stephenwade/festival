import type { LinksFunction } from '@remix-run/node';
import type { FC } from 'react';
import { useEffect } from 'react';
import { toast } from 'react-toastify';

import { links as spinnerLinks } from '~/components/Spinner';
import { links as toasterLinks, ToastContainer } from '~/components/Toaster';
import { links as volumeLinks, VolumeFab } from '~/components/VolumeFab';
import stylesUrl from '~/styles/show-playing.css';
import type { AudioStatus } from '~/types/AudioStatus';
import type { ShowInfo } from '~/types/ShowInfo';

import { AudioCanvas } from './AudioCanvas';
import { CurrentTime } from './CurrentTime';

export const links: LinksFunction = () => [
  ...spinnerLinks(),
  ...volumeLinks(),
  ...toasterLinks(),
  { rel: 'stylesheet', href: stylesUrl },
];

interface Props {
  volume: number;
  audioStatus: AudioStatus;
  audioError: boolean;
  showInfo: ShowInfo;

  getAudioVisualizerData: (() => Uint8Array) | null;
  onVolumeInput: (volume: number) => void;
}

export const ShowPlaying: FC<Props> = ({
  volume,
  audioStatus,
  audioError,
  showInfo,

  getAudioVisualizerData,
  onVolumeInput,
}) => {
  const waitingUntilStart = showInfo.status === 'WAITING_UNTIL_START';
  const playing = showInfo.status === 'PLAYING';

  useEffect(() => {
    if (audioError) {
      toast.dismiss();

      const verb =
        showInfo.status === 'WAITING_UNTIL_START' ? 'loading' : 'playing';
      toast.error(`There was a problem ${verb} the audio track.`);
    }

    // Only trigger when `audioError` changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioError]);

  useEffect(() => {
    if (audioStatus.stalled) {
      toast('Looks like your internet connection is having trouble.');
    }
  }, [audioStatus.stalled]);

  const showDelayToast =
    'delay' in showInfo && showInfo.delay && showInfo.delay >= 30;
  useEffect(() => {
    if (showDelayToast) {
      toast(
        `Looks like your audio player is out of sync. Delay: ${showInfo.delay} seconds`,
      );
    } else {
      toast('No longer out of sync!');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showDelayToast]);

  return (
    <div className="playing-container full-page">
      {showInfo.currentSet && playing ? (
        <AudioCanvas
          currentTime={showInfo.currentTime}
          setLength={showInfo.currentSet.duration}
          progressLineFrozen={
            audioStatus.paused || audioStatus.stalled || audioStatus.waiting
          }
          getAudioVisualizerData={getAudioVisualizerData}
        />
      ) : null}

      <CurrentTime
        showInfo={{
          ...showInfo,
          // @ts-expect-error testing
          currentTime: 'delay' in showInfo ? showInfo.delay ?? 0 : undefined,
        }}
        audioStatus={audioStatus}
      />

      {waitingUntilStart ? <div className="next-up">NEXT UP</div> : null}
      <div className="artist">{showInfo.currentSet?.artist}</div>

      <VolumeFab volume={volume} onVolumeInput={onVolumeInput} />

      <ToastContainer />
    </div>
  );
};
