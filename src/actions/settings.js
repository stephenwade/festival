export const setVolume = (volume) => ({
  type: 'SET_VOLUME',
  volume,
});

export const setLastUnmutedVolume = (volume) => ({
  type: 'SET_LAST_UNMUTED_VOLUME',
  volume,
});
