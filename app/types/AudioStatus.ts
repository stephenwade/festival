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
