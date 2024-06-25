import type { Dispatch, SetStateAction } from 'react';
import { useCallback } from 'react';
import useLocalStorageState from 'use-local-storage-state';

export function useVolume() {
  const [volume, setVolumeLocalStorage] = useLocalStorageState('volume', {
    defaultValue: 100,
    storageSync: false,
  });

  const [lastPositiveVolume, setLastPositiveVolume] = useLocalStorageState(
    'lastPositiveVolume',
    {
      defaultValue: volume === 0 ? 100 : volume,
      storageSync: false,
    },
  );

  const setVolume: Dispatch<SetStateAction<number>> = useCallback(
    (action) => {
      const newVolume = typeof action === 'function' ? action(volume) : action;
      setVolumeLocalStorage(newVolume);
      if (newVolume > 0) {
        setLastPositiveVolume(newVolume);
      }
    },
    [volume, setVolumeLocalStorage, setLastPositiveVolume],
  );

  const toggleMute: () => void = useCallback(() => {
    if (volume === 0) {
      setVolume(lastPositiveVolume);
    } else {
      setVolume(0);
    }
  }, [lastPositiveVolume, setVolume, volume]);

  return { volume, setVolume, toggleMute };
}
