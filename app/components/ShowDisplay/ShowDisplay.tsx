import { useShowStatus } from '../../playback';
import { ShowEnded } from '../ShowEnded';
import { ShowIntro } from '../ShowIntro';
import { ShowPlaying } from '../ShowPlaying';

interface ShowDisplayProps {
  showLogoUrl: string;
}

export function ShowDisplay({ showLogoUrl }: ShowDisplayProps) {
  const showStatus = useShowStatus();

  if (showStatus === 'WAITING_FOR_AUDIO_CONTEXT') {
    return <ShowIntro logoUrl={showLogoUrl} />;
  }

  if (showStatus === 'ENDED') {
    return <ShowEnded logoUrl={showLogoUrl} />;
  }

  // showStatus: "WAITING_UNTIL_START" | "PLAYING"
  return <ShowPlaying />;
}
