export default (
  state = {
    waiting: false,
    stalled: false,
    paused: false,
  },
  action
) => {
  switch (action.type) {
    case 'SET_AUDIO_STATUS':
      return action.audioStatus;

    default:
      return state;
  }
};
