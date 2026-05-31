import { useMemo, useState } from 'react';

import { VolumeFab } from '../../../app/components/VolumeFab';
import { PlaybackManagerContext } from '../../../app/playback';
import { mockPlaybackManager } from '../../../app/playback/PlaybackManager';
import { INITIAL_VOLUME } from './shared-data';

export function VolumeFabTest() {
  const [volume, setVolume] = useState(INITIAL_VOLUME);

  const mockedContext = useMemo(
    () => ({
      ...mockPlaybackManager,
      volume,
      setVolume,
    }),
    [volume],
  );

  return (
    <PlaybackManagerContext value={mockedContext}>
      <VolumeFab />
      <p>Volume: {volume}</p>
    </PlaybackManagerContext>
  );
}
