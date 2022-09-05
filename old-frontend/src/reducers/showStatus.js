export default (
  state = {
    status: 'WAITING_FOR_AUDIO_CONTEXT',
  },
  action
) => {
  switch (action.type) {
    case 'SET_SHOW_STATUS':
      return action.showStatus;

    default:
      return state;
  }
};
