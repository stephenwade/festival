export default (state = {}, action) => {
  switch (action.type) {
    case 'SET_TARGET_AUDIO_STATUS':
      return action.targetAudioStatus;

    default:
      return state;
  }
};
