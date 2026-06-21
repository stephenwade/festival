import type { SetStateAction } from 'react';
import { AudioContext } from 'standardized-audio-context';

import type { ShowInfo, TargetShowInfo } from '../../server/types/ShowInfo';
import type { Listener, Unsubscribe } from './ListenerSet';
import { ListenerSet } from './ListenerSet';
import { VolumeManager } from './VolumeManager';

export interface AudioStatus {
  waiting: boolean;
  stalled: boolean;
  paused: boolean;
}

export const initialAudioStatus: AudioStatus = {
  waiting: false,
  stalled: false,
  paused: false,
};

export class AudioManager {
  private readonly volumeManager: VolumeManager;

  private activeAudio: HTMLAudioElement;
  private inactiveAudio: HTMLAudioElement;
  private audioError_ = false;
  private audioStatus_ = { ...initialAudioStatus };

  private readonly forceSkipAudioContext: boolean;
  private audioContext?: AudioContext;
  private setAudioContextVolume?: (volume: number) => void;
  private getAudioVisualizerData_?: () => Uint8Array;

  private targetShowInfo: TargetShowInfo;
  private previousTargetShowInfo?: TargetShowInfo;

  private showInfo_: ShowInfo;
  private nextChange?: TargetShowInfo;

  private stalledTimeout?: NodeJS.Timeout;

  private readonly removeAudioListenerCallbacks: (() => void)[] = [];

  private readonly audioErrorListeners = new ListenerSet<boolean>();
  private readonly audioStatusListeners = new ListenerSet<AudioStatus>();
  private readonly loadedMetadataListeners = new ListenerSet<AudioMetadata>();
  private readonly showInfoListeners = new ListenerSet<ShowInfo>();
  private readonly unsubscribeVolume: Unsubscribe;

  constructor(
    targetShowInfo: TargetShowInfo,
    { forceSkipAudioContext = false } = {},
  ) {
    this.activeAudio = this.createAudioElement();
    this.inactiveAudio = this.createAudioElement();

    this.volumeManager = new VolumeManager();
    this.unsubscribeVolume = this.volumeManager.addVolumeListener((volume) => {
      this.setAudioContextVolume?.(volume);
    });

    this.forceSkipAudioContext = forceSkipAudioContext;

    this.targetShowInfo = targetShowInfo;

    this.showInfo_ =
      targetShowInfo.status === 'ENDED'
        ? { status: 'ENDED' }
        : { status: 'WAITING_FOR_AUDIO_CONTEXT' };
  }

  private resetAudioStatus() {
    this.audioStatus_ = { ...initialAudioStatus };
  }

  private createAudioElement(): HTMLAudioElement {
    const audio = document.createElement('audio');
    audio.crossOrigin = 'anonymous';

    this.addAudioEventListener(audio, 'ended', this.ended.bind(this));
    this.addAudioEventListener(audio, 'error', this.error.bind(this));
    this.addAudioEventListener(
      audio,
      'loadedmetadata',
      this.loadedMetadata.bind(this),
    );
    this.addAudioEventListener(audio, 'pause', this.pause.bind(this));
    this.addAudioEventListener(audio, 'playing', this.playing.bind(this));
    this.addAudioEventListener(audio, 'stalled', this.stalled.bind(this));
    this.addAudioEventListener(audio, 'timeupdate', this.timeUpdate.bind(this));
    this.addAudioEventListener(audio, 'waiting', this.waiting.bind(this));

    document.body.append(audio);

    return audio;
  }

  private addAudioEventListener<K extends keyof HTMLMediaElementEventMap>(
    audio: HTMLAudioElement,
    type: K,
    callback: (event: HTMLMediaElementEventMap[K]) => void,
  ) {
    audio.addEventListener(type, callback);
    this.removeAudioListenerCallbacks.push(() => {
      audio.removeEventListener(type, callback);
    });
  }

  private ended(event: GlobalEventHandlersEventMap['ended']) {
    if (event.target !== this.activeAudio) return;

    this.activeAudio.removeAttribute('src');

    // swap activeAudio and inactiveAudio
    [this.activeAudio, this.inactiveAudio] = [
      this.inactiveAudio,
      this.activeAudio,
    ];

    this.showInfo_ = { status: 'WAITING_UNTIL_START' };

    this.doNextStatusChange();

    this.resetAudioStatus();

    globalThis.clearTimeout(this.stalledTimeout);
  }

  private error() {
    this.audioError_ = true;
  }

  private loadedMetadata(event: GlobalEventHandlersEventMap['loadedmetadata']) {
    const set =
      event.target === this.activeAudio
        ? this.showInfo.currentSet
        : this.showInfo.nextSet;

    if (!set) return;

    this.loadedMetadataListeners.emit({
      setId: set.id,
      duration: (event.target as HTMLAudioElement).duration,
    });
  }

  private pause(event: GlobalEventHandlersEventMap['pause']) {
    if (event.target !== this.activeAudio) return;

    this.audioStatus_.paused = true;
  }

  private playing(event: GlobalEventHandlersEventMap['playing']) {
    if (event.target !== this.activeAudio) return;

    this.resetAudioStatus();

    globalThis.clearTimeout(this.stalledTimeout);
  }

  private stalled(event?: GlobalEventHandlersEventMap['stalled']) {
    if (event?.target !== this.activeAudio) return;

    // Safari: stalled events fire for seemingly no reason
    if (navigator.userAgent.includes('Safari')) return;

    this.audioStatus_.stalled = true;
  }

  private timeUpdate(event: GlobalEventHandlersEventMap['timeupdate']) {
    if (event.target !== this.activeAudio) return;

    if (this.showInfo.status === 'PLAYING') {
      const currentTime = this.activeAudio.currentTime;

      this.showInfo_ = { ...this.showInfo, currentTime };

      const nextSrcAlreadySet =
        this.inactiveAudio.attributes.getNamedItem('src')?.value ===
        this.showInfo.nextSet?.audioUrl;
      const lessThanOneMinuteLeft =
        this.showInfo.currentSet &&
        this.showInfo.currentSet.duration - this.showInfo.currentTime <= 60;
      const shouldPreloadNextSet =
        !nextSrcAlreadySet && this.showInfo.nextSet && lessThanOneMinuteLeft;
      if (shouldPreloadNextSet && this.showInfo.nextSet.audioUrl) {
        this.inactiveAudio.src = this.showInfo.nextSet.audioUrl;
      }
    }
  }

  private waiting(event: GlobalEventHandlersEventMap['waiting']) {
    if (event.target !== this.activeAudio) return;

    this.audioStatus_.waiting = true;

    globalThis.clearTimeout(this.stalledTimeout);
    this.stalledTimeout = globalThis.setTimeout(() => {
      this.stalled();
    }, 10 * 1000);
  }

  private setupAudioContext() {
    const audioContext = new AudioContext();

    const analyserNode = audioContext.createAnalyser();
    analyserNode.fftSize = 1024;
    analyserNode.minDecibels = -85;
    analyserNode.smoothingTimeConstant = 0.75;

    const gainNode = audioContext.createGain();
    this.setAudioContextVolume = (volume) => {
      if (volume < 0) gainNode.gain.value = 0;
      else if (volume > 100) gainNode.gain.value = 1;
      else gainNode.gain.value = volume / 100;
    };

    this.setAudioContextVolume(this.volumeManager.volume / 100);

    for (const audio of [this.activeAudio, this.inactiveAudio]) {
      audioContext
        .createMediaElementSource(audio)
        .connect(analyserNode)
        .connect(gainNode)
        .connect(audioContext.destination);
    }

    const audioVisualizerData = new Uint8Array(analyserNode.frequencyBinCount);

    this.getAudioVisualizerData_ = () => {
      analyserNode.getByteFrequencyData(audioVisualizerData);
      return audioVisualizerData;
    };

    this.audioContext = audioContext;
  }

  private checkTargetShowInfo({ ignoreAudioContext = false } = {}) {
    if (this.audioError_) return;

    const ended = this.targetShowInfo.status === 'ENDED';
    const waitingForAudioContext =
      !ignoreAudioContext &&
      this.showInfo.status === 'WAITING_FOR_AUDIO_CONTEXT';

    if (waitingForAudioContext && !ended) return;

    const previousTargetShowInfo = this.previousTargetShowInfo;

    const firstRun = !previousTargetShowInfo;
    if (firstRun) {
      this.previousTargetShowInfo = this.targetShowInfo;
      this.queueStatusChange();
    } else {
      const statusChanged =
        this.targetShowInfo.status !== previousTargetShowInfo.status;
      const setChanged =
        this.targetShowInfo.currentSet?.id !==
        previousTargetShowInfo.currentSet?.id;
      const secondsUntilSetChanged =
        this.targetShowInfo.status === 'WAITING_UNTIL_START' &&
        previousTargetShowInfo.status === 'WAITING_UNTIL_START' &&
        this.targetShowInfo.secondsUntilSet !==
          previousTargetShowInfo.secondsUntilSet;
      const currentTimeChanged =
        this.targetShowInfo.status === 'PLAYING' &&
        previousTargetShowInfo.status === 'PLAYING' &&
        this.targetShowInfo.currentTime !== previousTargetShowInfo.currentTime;

      const timeChanged = secondsUntilSetChanged || currentTimeChanged;
      const anythingChanged = timeChanged || statusChanged || setChanged;

      this.previousTargetShowInfo = this.targetShowInfo;

      if (anythingChanged) {
        this.queueStatusChange();
      }

      if (timeChanged) {
        this.updateTime();
      }
    }
  }

  private queueStatusChange() {
    this.nextChange = this.targetShowInfo;

    if (this.showInfo.status !== 'PLAYING') {
      this.doNextStatusChange();
    }
  }

  private doNextStatusChange() {
    const change = this.nextChange;
    if (!change) {
      return;
    }
    const activeAudio = this.activeAudio;
    this.nextChange = undefined;

    const setChanged = change.currentSet !== this.showInfo.currentSet;
    const nextSrcAlreadySet =
      activeAudio.attributes.getNamedItem('src')?.value ===
      change.currentSet?.audioUrl;
    const shouldChangeSrc = setChanged && !nextSrcAlreadySet;

    let newShowInfo: ShowInfo;

    switch (change.status) {
      case 'WAITING_UNTIL_START': {
        if (shouldChangeSrc && change.currentSet?.audioUrl) {
          activeAudio.src = change.currentSet.audioUrl;
        }

        newShowInfo = {
          currentSet: change.currentSet,
          status: 'WAITING_UNTIL_START',
          secondsUntilSet: change.secondsUntilSet,
          nextSet: change.nextSet,
        };

        break;
      }
      case 'PLAYING': {
        if (shouldChangeSrc && change.currentSet?.audioUrl) {
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

        break;
      }
      case 'ENDED': {
        newShowInfo = { status: 'ENDED' };

        break;
      }
    }

    this.showInfo_ = newShowInfo;
    this.showInfoListeners.emit(this.showInfo);
  }

  private updateTime() {
    let newShowInfo: ShowInfo | undefined;

    if (
      this.showInfo.status === 'WAITING_UNTIL_START' &&
      this.targetShowInfo.status === 'WAITING_UNTIL_START'
    ) {
      newShowInfo = {
        ...this.showInfo,
        secondsUntilSet: this.targetShowInfo.secondsUntilSet,
      };
    } else if (
      this.showInfo.status === 'PLAYING' &&
      this.targetShowInfo.status === 'PLAYING'
    ) {
      let delay =
        this.targetShowInfo.currentTime - this.activeAudio.currentTime;
      if (
        this.targetShowInfo.currentSet &&
        this.showInfo.currentSet &&
        this.targetShowInfo.currentSet.id !== this.showInfo.currentSet.id
      ) {
        const setDifference = this.showInfo.currentSet.start
          .until(this.targetShowInfo.currentSet.start)
          .total({ unit: 'seconds' });
        delay += setDifference;
      }

      if (delay < 0) delay = 0;

      newShowInfo = {
        ...this.showInfo,
        delay,
      };
    }

    if (newShowInfo) {
      this.showInfo_ = newShowInfo;
      this.showInfoListeners.emit(this.showInfo);
    }
  }

  get audioStatus(): Readonly<typeof this.audioStatus_> {
    return this.audioStatus_;
  }

  get audioError() {
    return this.audioError_;
  }

  get getAudioVisualizerData() {
    return this.getAudioVisualizerData_;
  }

  get showInfo(): Readonly<typeof this.showInfo_> {
    return this.showInfo_;
  }

  addAudioErrorListener(listener: Listener<boolean>): Unsubscribe {
    return this.audioErrorListeners.subscribe(listener);
  }

  addAudioStatusListener(listener: Listener<AudioStatus>): Unsubscribe {
    return this.audioStatusListeners.subscribe(listener);
  }

  addLoadedMetadataListener(listener: Listener<AudioMetadata>): Unsubscribe {
    return this.loadedMetadataListeners.subscribe(listener);
  }

  addShowInfoListener(listener: Listener<ShowInfo>): Unsubscribe {
    return this.showInfoListeners.subscribe(listener);
  }

  get volume() {
    return this.volumeManager.volume;
  }

  setVolume(volume: SetStateAction<number>) {
    this.volumeManager.setVolume(volume);
  }

  toggleMute() {
    this.volumeManager.toggleMute();
  }

  addVolumeListener(listener: Listener<number>): Unsubscribe {
    return this.volumeManager.addVolumeListener(listener);
  }

  updateTargetShowInfo(targetShowInfo: TargetShowInfo) {
    this.targetShowInfo = targetShowInfo;

    this.checkTargetShowInfo();
  }

  initializeAudio() {
    if (this.targetShowInfo.status === 'ENDED') return;

    if (!this.forceSkipAudioContext) {
      try {
        this.setupAudioContext();
      } catch {
        // ignore errors
      }
    }

    for (const audio of [this.activeAudio, this.inactiveAudio]) {
      // Safari: activate the audio element by trying to play
      audio.play().catch(() => {
        // ignore errors
      });
      // Firefox: if you don't pause after trying to play, it will start to play
      // as soon as src is set
      audio.pause();
    }

    this.audioContext?.resume().catch(() => {
      // ignore errors
    });

    this.checkTargetShowInfo({ ignoreAudioContext: true });
  }

  dispose() {
    this.unsubscribeVolume();
    this.volumeManager.dispose();

    this.loadedMetadataListeners.clear();
    this.showInfoListeners.clear();

    for (const cb of this.removeAudioListenerCallbacks) {
      cb();
    }
    this.activeAudio.remove();
    this.inactiveAudio.remove();
  }
}

export interface AudioMetadata {
  setId: string;
  duration: number;
}
