import { useQueryClient } from '@tanstack/react-query';
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import type { ShowData } from '../../server/types/ShowData';
import { useTRPC } from '../trpc';
import type { Subscribe } from './ListenerSet';
import type { PlaybackManagerContract } from './PlaybackManager';
import { PlaybackManager } from './PlaybackManager';

export const PlaybackManagerContext = createContext<
  PlaybackManagerContract | undefined
>(undefined);

interface PlaybackProviderProps {
  showData?: ShowData;
  children: ReactNode;
}

export function PlaybackProvider({
  showData,
  children,
}: PlaybackProviderProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const playbackManager = useMemo(() => {
    if (!showData) {
      return undefined;
    }

    return new PlaybackManager(showData, () =>
      queryClient.fetchQuery(
        trpc.show.getShowData.queryOptions({ slug: showData.slug }),
      ),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showData?.slug]);

  useEffect(() => {
    return () => {
      playbackManager?.dispose();
    };
  }, [playbackManager]);

  if (!playbackManager) {
    return null;
  }

  return (
    <PlaybackManagerContext.Provider value={playbackManager}>
      {children}
    </PlaybackManagerContext.Provider>
  );
}

function usePlaybackManager() {
  return useContext(PlaybackManagerContext)!;
}

function usePlaybackManagerValue<T>(
  getter: (playbackManager: PlaybackManagerContract) => T,
  subscribeGetter: (playbackManager: PlaybackManagerContract) => Subscribe<T>,
): T;
function usePlaybackManagerValue<T, R>(
  getter: (playbackManager: PlaybackManagerContract) => T,
  subscribeGetter: (playbackManager: PlaybackManagerContract) => Subscribe<T>,
  refiner: (value: T) => R,
): R;
function usePlaybackManagerValue<T, R>(
  getter: (playbackManager: PlaybackManagerContract) => T,
  subscribeGetter: (playbackManager: PlaybackManagerContract) => Subscribe<T>,
  refiner?: (value: T) => R,
): T | R {
  const playbackManager = usePlaybackManager();

  const refineValue = (value: T) => {
    if (refiner) {
      return refiner(value);
    }

    return value;
  };

  const [value, setValue] = useState<T | R>(
    refineValue(getter(playbackManager)),
  );

  const setValueRef = useRef<typeof setValue>(setValue);
  setValueRef.current = setValue;

  useEffect(() => {
    const unsubscribe = subscribeGetter(playbackManager).bind(playbackManager)(
      (value) => {
        setValueRef.current(refineValue(value));
      },
    );

    setValue(refineValue(getter(playbackManager)));

    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playbackManager]);

  return value;
}

function usePlaybackManagerMethod<
  T extends ((...args: never[]) => unknown) | undefined,
>(getter: (playbackManager: PlaybackManagerContract) => T): T {
  const playbackManager = usePlaybackManager();

  const result = useMemo(() => {
    return getter(playbackManager)?.bind(playbackManager) as T;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playbackManager]);

  return result;
}

export function useAudioError() {
  return usePlaybackManagerValue(
    (m) => m.audioError,
    (m) => m.addAudioErrorListener,
  );
}

export function useAudioStatus() {
  return usePlaybackManagerValue(
    (m) => m.audioStatus,
    (m) => m.addAudioStatusListener,
  );
}

export function useShowInfo() {
  return usePlaybackManagerValue(
    (m) => m.showInfo,
    (m) => m.addShowInfoListener,
  );
}

export function useShowStatus() {
  return usePlaybackManagerValue(
    (m) => m.showInfo,
    (m) => m.addShowInfoListener,
    (showInfo) => showInfo.status,
  );
}

export function useGetAudioVisualizerData() {
  return usePlaybackManagerMethod((m) => m.getAudioVisualizerData);
}

export function useInitializeAudio() {
  return usePlaybackManagerMethod((m) => m.initializeAudio);
}

export function useVolume() {
  const volume = usePlaybackManagerValue(
    (m) => m.volume,
    (m) => m.addVolumeListener,
  );

  const setVolume = usePlaybackManagerMethod((m) => m.setVolume);

  const toggleMute = usePlaybackManagerMethod((m) => m.toggleMute);

  return { volume, setVolume, toggleMute };
}
