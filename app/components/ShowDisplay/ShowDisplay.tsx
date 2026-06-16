import type { ShowData } from '../../../server/types/ShowData';
import { useShowStatus } from '../../playback';
import { ShowEnded } from '../ShowEnded';
import { ShowIntro } from '../ShowIntro';
import { ShowPlaying } from '../ShowPlaying';

interface ShowDisplayProps {
  showData: ShowData;
}

export function ShowDisplay({ showData }: ShowDisplayProps) {
  const showStatus = useShowStatus();

  if (showStatus === 'WAITING_FOR_AUDIO_CONTEXT') {
    return <ShowIntro showData={showData} />;
  }

  if (showStatus === 'ENDED') {
    return <ShowEnded showData={showData} />;
  }

  // showStatus: "WAITING_UNTIL_START" | "PLAYING"
  return <ShowPlaying />;
}
