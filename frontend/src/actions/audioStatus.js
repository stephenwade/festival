export const audioEnded = () => ({
  type: 'RESET_AUDIO_STATUS',
});

export const audioPaused = () => ({
  type: 'AUDIO_PAUSED',
});

export const audioPlaying = () => ({
  type: 'RESET_AUDIO_STATUS',
});

export const audioStalled = () => ({
  type: 'AUDIO_STALLED',
});

export const audioWaiting = () => ({
  type: 'AUDIO_WAITING',
});
