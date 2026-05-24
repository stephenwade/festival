import { useMemo } from 'react';

import { ShowPlaying } from '../../../app/components/ShowPlaying';
import { PlaybackManagerContext } from '../../../app/playback';
import { mockPlaybackManager } from '../../../app/playback/PlaybackManager';
import type { ShowInfo } from '../../../server/types/ShowInfo';

export function ShowPlayingTest({ showInfo }: { showInfo: ShowInfo }) {
  const mockedContext = useMemo(
    () => ({
      ...mockPlaybackManager,
      showInfo,
    }),
    [showInfo],
  );

  return (
    <PlaybackManagerContext.Provider value={mockedContext}>
      <ShowPlaying />
    </PlaybackManagerContext.Provider>
  );
}
