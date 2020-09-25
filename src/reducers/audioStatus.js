const getDefaultState = () => ({
  waiting: false,
  stalled: false,
  paused: false,
});

export default (state = getDefaultState(), action) => {
  switch (action.type) {
    case 'RESET_AUDIO_STATUS':
      return getDefaultState();

    case 'AUDIO_PAUSED':
      return { ...state, paused: true };

    case 'AUDIO_STALLED':
      return { ...state, stalled: true };

    case 'AUDIO_WAITING':
      return { ...state, waiting: true };

    default:
      return state;
  }
};
