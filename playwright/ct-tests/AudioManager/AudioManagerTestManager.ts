import { AudioManager } from '../../../app/playback/AudioManager';
import type { Unsubscribe } from '../../../app/playback/ListenerSet';
import { TargetShowManager } from '../../../app/playback/TargetShowManager';
import type { ShowData } from '../../../server/types/ShowData';

export class AudioManagerTestManager {
  private readonly audioManager: AudioManager;
  private readonly targetShowManager: TargetShowManager;

  private readonly unsubscribeTargetShowInfo: Unsubscribe;
  private readonly unsubscribeLoadedMetadata: Unsubscribe;

  private useAlternateData = false;

  constructor(
    showData: ShowData,
    audioManagerParams?: ConstructorParameters<typeof AudioManager>[1],
  ) {
    this.targetShowManager = new TargetShowManager(
      showData,
      () => Promise.resolve(showData),
      { ci: true },
    );

    this.audioManager = new AudioManager(
      this.calculateTargetShowInfo(),
      audioManagerParams,
    );

    this.unsubscribeTargetShowInfo =
      this.targetShowManager.addTargetShowInfoListener(() => {
        this.audioManager.updateTargetShowInfo(this.calculateTargetShowInfo());
      });

    this.unsubscribeLoadedMetadata =
      this.audioManager.addLoadedMetadataListener((metadata) => {
        this.targetShowManager.onLoadedMetadata(metadata);
      });
  }

  private calculateTargetShowInfo() {
    const targetShowInfo = this.targetShowManager.targetShowInfo;

    if (!this.useAlternateData) {
      return targetShowInfo;
    }

    const result = structuredClone(targetShowInfo);

    for (const set of [result.currentSet, result.nextSet]) {
      if (!set) continue;

      set.id += ' alternate';
      if (set.audioUrl) {
        set.audioUrl += '?alternate';
      }
      set.artist += ' alternate';
    }

    return result;
  }

  setAlternateData(useAlternateData: boolean) {
    this.useAlternateData = useAlternateData;
    this.audioManager.updateTargetShowInfo(this.calculateTargetShowInfo());
  }

  get showInfo() {
    return this.audioManager.showInfo;
  }

  get addShowInfoListener() {
    return this.audioManager.addShowInfoListener.bind(this.audioManager);
  }

  get addLoadedMetadataListener() {
    return this.audioManager.addLoadedMetadataListener.bind(this.audioManager);
  }

  get getAudioVisualizerData() {
    return this.audioManager.getAudioVisualizerData?.bind(this.audioManager);
  }

  get initializeAudio() {
    return this.audioManager.initializeAudio.bind(this.audioManager);
  }

  dispose() {
    this.unsubscribeLoadedMetadata();
    this.unsubscribeTargetShowInfo();

    this.audioManager.dispose();
    this.targetShowManager.dispose();
  }
}
