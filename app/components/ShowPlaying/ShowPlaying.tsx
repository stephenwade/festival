import '~/styles/show-playing.css';

import type { FC } from 'react';
import { useEffect } from 'react';
import { toast } from 'react-toastify';

import { ToastContainer } from '~/components/ToastContainer';
import { VolumeFab } from '~/components/VolumeFab';
import type { AudioStatus } from '~/types/AudioStatus';
import type { ShowInfo } from '~/types/ShowInfo';

import { AudioCanvas } from './AudioCanvas';
import { CurrentTime } from './CurrentTime';

export interface ShowPlayingProps {
  audioStatus: AudioStatus;
  audioError: boolean;
  showInfo: ShowInfo;

  getAudioVisualizerData: (() => Uint8Array) | null;
}

export const ShowPlaying: FC<ShowPlayingProps> = ({
  audioStatus,
  audioError,
  showInfo,

  getAudioVisualizerData,
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
      toast(<div>Looks like your internet connection is having trouble.</div>);
    }
  }, [audioStatus.stalled]);

  const showDelayToast =
    'delay' in showInfo && showInfo.delay && showInfo.delay >= 30;
  useEffect(() => {
    if (showDelayToast) {
      toast(<div>Looks like your audio player is out of sync.</div>);
      return () => {
        toast.dismiss();
      };
    }
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

      <CurrentTime showInfo={showInfo} audioStatus={audioStatus} />

      {waitingUntilStart ? <div className="next-up">NEXT UP</div> : null}
      <div className="artist">{showInfo.currentSet?.artist}</div>

      <VolumeFab />

      <ToastContainer />
    </div>
  );
};
