import type { ShowData } from '../../server/types/ShowData';
import { AudioManager, initialAudioStatus } from './AudioManager';
import type { Unsubscribe } from './ListenerSet';
import { TargetShowManager } from './TargetShowManager';

type GetShowData = ConstructorParameters<typeof TargetShowManager>[1];

export class PlaybackManager {
  private readonly audioManager: AudioManager;
  private readonly targetShowManager: TargetShowManager;

  private readonly unsubscribeTargetShowInfo: Unsubscribe;

  constructor(showData: ShowData, getShowData: GetShowData) {
    this.targetShowManager = new TargetShowManager(showData, getShowData);

    this.audioManager = new AudioManager(this.targetShowManager.targetShowInfo);

    this.unsubscribeTargetShowInfo =
      this.targetShowManager.addTargetShowInfoListener((targetShowInfo) => {
        this.audioManager.updateTargetShowInfo(targetShowInfo);
      });
  }

  set getShowData(getShowData: TargetShowManager['getShowData']) {
    this.targetShowManager.getShowData = getShowData;
  }

  get audioError() {
    return this.audioManager.audioError;
  }

  get addAudioErrorListener() {
    return this.audioManager.addAudioErrorListener.bind(this.audioManager);
  }

  get audioStatus() {
    return this.audioManager.audioStatus;
  }

  get addAudioStatusListener() {
    return this.audioManager.addAudioStatusListener.bind(this.audioManager);
  }

  get showInfo() {
    return this.audioManager.showInfo;
  }

  get addShowInfoListener() {
    return this.audioManager.addShowInfoListener.bind(this.audioManager);
  }

  get volume() {
    return this.audioManager.volume;
  }

  get addVolumeListener() {
    return this.audioManager.addVolumeListener.bind(this.audioManager);
  }

  // AudioManager callbacks

  get getAudioVisualizerData() {
    return this.audioManager.getAudioVisualizerData?.bind(this.audioManager);
  }

  get initializeAudio() {
    return this.audioManager.initializeAudio.bind(this.audioManager);
  }

  get setVolume() {
    return this.audioManager.setVolume.bind(this.audioManager);
  }

  get toggleMute() {
    return this.audioManager.toggleMute.bind(this.audioManager);
  }

  // Other

  dispose() {
    this.unsubscribeTargetShowInfo();

    this.audioManager.dispose();
    this.targetShowManager.dispose();
  }
}

export type PlaybackManagerContract = Pick<
  PlaybackManager,
  keyof PlaybackManager
>;

/* eslint-disable unicorn/consistent-function-scoping -- Harder to read in this case */
export const mockPlaybackManager = {
  getShowData: () => undefined as unknown as Promise<ShowData>,
  audioError: false,
  addAudioErrorListener: () => () => undefined,
  audioStatus: initialAudioStatus,
  addAudioStatusListener: () => () => undefined,
  showInfo: { status: 'WAITING_FOR_AUDIO_CONTEXT' },
  addShowInfoListener: () => () => undefined,
  volume: 100,
  addVolumeListener: () => () => undefined,
  getAudioVisualizerData: undefined,
  initializeAudio: () => undefined,
  setVolume: () => undefined,
  toggleMute: () => undefined,
  dispose: () => undefined,
} satisfies PlaybackManagerContract;
/* eslint-enable */
