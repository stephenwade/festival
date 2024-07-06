/* eslint-disable jsx-a11y/media-has-caption */

import { differenceInSeconds } from 'date-fns';
import type { AudioHTMLAttributes, FC, ReactNode, SyntheticEvent } from 'react';
import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';
import { AudioContext } from 'standardized-audio-context';

import { useVolume } from '~/hooks/useVolume';
import type { AudioStatus } from '~/types/AudioStatus';
import { initialAudioStatus } from '~/types/AudioStatus';
import type { ShowInfo, TargetShowInfo } from '~/types/ShowInfo';

interface State {
  activeAudio: HTMLAudioElement | null;
  inactiveAudio: HTMLAudioElement | null;

  audioContext: AudioContext | null;
  setVolume: ((volume: number) => void) | null;
  getAudioVisualizerData: (() => Uint8Array) | null;

  lastTargetShowInfo: TargetShowInfo | null;
  nextChange: ShowInfo | null;

  stalledTimeout: NodeJS.Timeout | null;
}

export interface AudioMetadata {
  id: string;
  duration: number;
}

interface AudioControllerProps {
  targetShowInfo: TargetShowInfo;
  onLoadedMetadata: (args: AudioMetadata) => void;
  /** Used in CI */
  forceSkipAudioContext?: boolean;

  children: (args: {
    showInfo: ShowInfo;
    audioStatus: AudioStatus;
    audioError: boolean;

    initializeAudio: () => Promise<void>;
    getAudioVisualizerData: (() => Uint8Array) | null;
  }) => ReactNode;
}

export const AudioController: FC<AudioControllerProps> = ({
  targetShowInfo,
  onLoadedMetadata,
  forceSkipAudioContext,
  children,
}) => {
  const { volume } = useVolume();

  const [showInfo, setShowInfo] = useState<ShowInfo>(
    targetShowInfo.status === 'ENDED'
      ? { status: 'ENDED' }
      : { status: 'WAITING_FOR_AUDIO_CONTEXT' },
  );
  const [audioError, setAudioError] = useState(false);

  const audio1Ref = useRef<HTMLAudioElement>(null);
  const audio2Ref = useRef<HTMLAudioElement>(null);

  const stateRef = useRef<State>({
    activeAudio: null,
    inactiveAudio: null,

    audioContext: null,
    setVolume: null,
    getAudioVisualizerData: null,

    lastTargetShowInfo: null,
    nextChange: null,

    stalledTimeout: null,
  });

  const [audioStatus, dispatchAudioStatus] = useReducer(
    (
      state: AudioStatus,
      action:
        | 'RESET_AUDIO_STATUS'
        | 'AUDIO_PAUSED'
        | 'AUDIO_STALLED'
        | 'AUDIO_WAITING',
    ) => {
      switch (action) {
        case 'RESET_AUDIO_STATUS':
          return initialAudioStatus;

        case 'AUDIO_PAUSED':
          return { ...state, paused: true };

        case 'AUDIO_STALLED':
          return { ...state, stalled: true };

        case 'AUDIO_WAITING':
          return { ...state, waiting: true };
      }
    },
    initialAudioStatus,
  );

  const setupAudioContext = useCallback(() => {
    const state = stateRef.current;

    const audioContext = new AudioContext();

    const tracks = [state.activeAudio, state.inactiveAudio].map((audio) => {
      if (audio) {
        return audioContext.createMediaElementSource(audio);
      }
      return null;
    });

    const analyserNode = audioContext.createAnalyser();
    analyserNode.fftSize = 1024;
    analyserNode.minDecibels = -85;
    analyserNode.smoothingTimeConstant = 0.75;

    const audioVisualizerData = new Uint8Array(analyserNode.frequencyBinCount);

    const gainNode = audioContext.createGain();
    state.setVolume = (volume) => {
      if (volume < 0) gainNode.gain.value = 0;
      else if (volume > 100) gainNode.gain.value = 1;
      else gainNode.gain.value = volume / 100;
    };

    state.setVolume(volume / 100);

    for (const track of tracks) {
      if (track) {
        track
          .connect(analyserNode)
          .connect(gainNode)
          .connect(audioContext.destination);
      }
    }

    state.getAudioVisualizerData = () => {
      analyserNode.getByteFrequencyData(audioVisualizerData);
      return audioVisualizerData;
    };

    return audioContext;
  }, [volume]);

  const doNextStatusChange = useCallback(() => {
    const state = stateRef.current;

    const change = state.nextChange;
    const activeAudio = state.activeAudio;
    if (change === null || activeAudio === null) {
      return;
    }
    state.nextChange = null;

    const setChanged = change.currentSet !== showInfo.currentSet;
    const nextSrcAlreadySet =
      activeAudio.attributes.getNamedItem('src')?.value ===
      change.currentSet?.audioUrl;
    const shouldChangeSrc = setChanged && !nextSrcAlreadySet;

    let newShowInfo: ShowInfo;

    if (change.status === 'WAITING_UNTIL_START') {
      if (shouldChangeSrc && change.currentSet) {
        activeAudio.src = change.currentSet.audioUrl;
      }

      newShowInfo = {
        currentSet: change.currentSet,
        status: 'WAITING_UNTIL_START',
        secondsUntilSet: change.secondsUntilSet,
        nextSet: change.nextSet,
      };
    } else if (change.status === 'PLAYING') {
      if (shouldChangeSrc && change.currentSet) {
        activeAudio.src = change.currentSet.audioUrl;
      }

      if (change.currentTime > 0) {
        activeAudio.src += `#t=${change.currentTime}`;
      }

      void activeAudio.play();

      newShowInfo = {
        currentSet: change.currentSet,
        status: 'PLAYING',
        currentTime: change.currentTime,
        nextSet: change.nextSet,
      };
    } else if (change.status === 'ENDED') {
      newShowInfo = { status: 'ENDED' };
    } else {
      throw new Error('Unknown status');
    }

    setShowInfo(newShowInfo);
  }, [showInfo.currentSet]);

  const queueStatusChange = useCallback(
    (change: ShowInfo) => {
      const state = stateRef.current;

      state.nextChange = change;

      if (showInfo.status !== 'PLAYING') {
        doNextStatusChange();
      }
    },
    [doNextStatusChange, showInfo.status],
  );

  const updateTime = useCallback(
    (change: TargetShowInfo) => {
      const state = stateRef.current;

      if (state.activeAudio === null) {
        return;
      }

      let newShowInfo: ShowInfo | undefined;

      if (
        showInfo.status === 'WAITING_UNTIL_START' &&
        change.status === 'WAITING_UNTIL_START'
      ) {
        newShowInfo = {
          ...showInfo,
          secondsUntilSet: change.secondsUntilSet,
        };
      } else if (showInfo.status === 'PLAYING' && change.status === 'PLAYING') {
        let delay = change.currentTime - state.activeAudio.currentTime;
        if (
          change.currentSet &&
          showInfo.currentSet &&
          change.currentSet.id !== showInfo.currentSet.id
        ) {
          const setDifference = differenceInSeconds(
            change.currentSet.start,
            showInfo.currentSet.start,
          );
          delay += setDifference;
        }

        if (delay < 0) delay = 0;

        newShowInfo = {
          ...showInfo,
          delay,
        };
      }

      if (newShowInfo) {
        setShowInfo(newShowInfo);
      }
    },
    [showInfo],
  );

  const checkTargetShowInfo = useCallback(
    ({ ignoreAudioContext = false } = {}) => {
      if (audioError) return;

      const state = stateRef.current;

      const ended = targetShowInfo.status === 'ENDED';
      const waitingForAudioContext =
        !ignoreAudioContext && showInfo.status === 'WAITING_FOR_AUDIO_CONTEXT';

      if (waitingForAudioContext && !ended) return;

      const lastTargetShowInfo = state.lastTargetShowInfo;

      const firstRun = !lastTargetShowInfo;
      if (firstRun) {
        state.lastTargetShowInfo = targetShowInfo;
        queueStatusChange(targetShowInfo);
      } else {
        const statusChanged =
          targetShowInfo.status !== lastTargetShowInfo.status;
        const setChanged =
          targetShowInfo.currentSet?.id !== lastTargetShowInfo.currentSet?.id;
        const secondsUntilSetChanged =
          targetShowInfo.status === 'WAITING_UNTIL_START' &&
          lastTargetShowInfo.status === 'WAITING_UNTIL_START' &&
          targetShowInfo.secondsUntilSet !== lastTargetShowInfo.secondsUntilSet;
        const currentTimeChanged =
          targetShowInfo.status === 'PLAYING' &&
          lastTargetShowInfo.status === 'PLAYING' &&
          targetShowInfo.currentTime !== lastTargetShowInfo.currentTime;

        const timeChanged = secondsUntilSetChanged || currentTimeChanged;
        const anythingChanged = timeChanged || statusChanged || setChanged;

        state.lastTargetShowInfo = targetShowInfo;

        if (anythingChanged) {
          queueStatusChange(targetShowInfo);
        }

        if (timeChanged) {
          updateTime(targetShowInfo);
        }
      }
    },
    [
      audioError,
      queueStatusChange,
      showInfo.status,
      targetShowInfo,
      updateTime,
    ],
  );

  const initializeAudio = useCallback(async () => {
    if (targetShowInfo.status === 'ENDED') return;

    const state = stateRef.current;

    if (!forceSkipAudioContext) {
      try {
        state.audioContext = setupAudioContext();
      } catch {
        // ignore errors
      }
    }

    for (const audio of [audio1Ref.current, audio2Ref.current]) {
      if (audio) {
        // Safari: activate the audio element by trying to play
        audio.play().catch(() => {
          // ignore errors
        });
        // Firefox: if you don't pause after trying to play, it will start to play
        // as soon as src is set
        audio.pause();
      }
    }

    if (state.audioContext) {
      try {
        await state.audioContext.resume();
      } catch {
        // ignore errors
      }
    }

    checkTargetShowInfo({ ignoreAudioContext: true });
  }, [
    checkTargetShowInfo,
    forceSkipAudioContext,
    setupAudioContext,
    targetShowInfo.status,
  ]);

  const onStalled = useCallback((e?: SyntheticEvent<HTMLAudioElement>) => {
    const state = stateRef.current;

    if (e?.target !== state.activeAudio) return;

    // Safari: stalled events fire for seemingly no reason
    if (navigator.userAgent.includes('Safari')) return;

    dispatchAudioStatus('AUDIO_STALLED');
  }, []);

  const audioEvents: AudioHTMLAttributes<HTMLAudioElement> = useMemo(
    () => ({
      onEnded: (e) => {
        const state = stateRef.current;

        if (e.target !== state.activeAudio) return;

        state.activeAudio.removeAttribute('src');

        // prettier-ignore
        // swap activeAudio and inactiveAudio
        [state.activeAudio, state.inactiveAudio] =
          [state.inactiveAudio, state.activeAudio];

        setShowInfo({
          status: 'WAITING_UNTIL_START',
        });

        doNextStatusChange();

        dispatchAudioStatus('RESET_AUDIO_STATUS');

        if (state.stalledTimeout) clearTimeout(state.stalledTimeout);
      },
      onError: () => {
        setAudioError(true);
      },
      onLoadedMetadata: (e) => {
        const state = stateRef.current;

        const set =
          e.target === state.activeAudio
            ? showInfo.currentSet
            : showInfo.nextSet;

        if (!set) return;

        onLoadedMetadata({
          id: set.id,
          duration: (e.target as HTMLAudioElement).duration,
        });
      },
      onPause: (e) => {
        const state = stateRef.current;

        if (e.target !== state.activeAudio) return;

        dispatchAudioStatus('AUDIO_PAUSED');
      },
      onPlaying: (e) => {
        const state = stateRef.current;

        if (e.target !== state.activeAudio) return;

        dispatchAudioStatus('RESET_AUDIO_STATUS');

        if (state.stalledTimeout) clearTimeout(state.stalledTimeout);
      },
      onStalled,
      onTimeUpdate: (e) => {
        const state = stateRef.current;

        if (e.target !== state.activeAudio) return;

        if (showInfo.status === 'PLAYING') {
          const currentTime = state.activeAudio.currentTime;

          setShowInfo({
            ...showInfo,
            currentTime,
          });

          const nextSrcAlreadySet =
            state.inactiveAudio?.attributes.getNamedItem('src')?.value ===
            showInfo.nextSet?.audioUrl;
          const lessThanOneMinuteLeft =
            showInfo.currentSet &&
            showInfo.currentSet.duration - showInfo.currentTime <= 60;
          const shouldPreloadNextSet =
            !nextSrcAlreadySet && showInfo.nextSet && lessThanOneMinuteLeft;
          if (shouldPreloadNextSet && state.inactiveAudio && showInfo.nextSet) {
            state.inactiveAudio.src = showInfo.nextSet.audioUrl;
          }
        }
      },
      onWaiting: (e) => {
        const state = stateRef.current;

        if (e.target !== state.activeAudio) return;

        dispatchAudioStatus('AUDIO_WAITING');

        if (state.stalledTimeout) clearTimeout(state.stalledTimeout);
        state.stalledTimeout = setTimeout(() => {
          onStalled();
        }, 10 * 1000);
      },
    }),
    [doNextStatusChange, onLoadedMetadata, onStalled, showInfo],
  );

  // This will only run once.
  useEffect(() => {
    const state = stateRef.current;

    state.activeAudio = audio1Ref.current;
    state.inactiveAudio = audio2Ref.current;
  }, []);

  useEffect(() => {
    const state = stateRef.current;

    checkTargetShowInfo();
    state.setVolume?.(volume);
  }, [checkTargetShowInfo, volume]);

  return (
    <>
      {children({
        showInfo,
        audioStatus,
        audioError,

        initializeAudio,
        getAudioVisualizerData: stateRef.current.getAudioVisualizerData,
      })}
      <audio ref={audio1Ref} crossOrigin="anonymous" {...audioEvents} />
      <audio ref={audio2Ref} crossOrigin="anonymous" {...audioEvents} />
    </>
  );
};
