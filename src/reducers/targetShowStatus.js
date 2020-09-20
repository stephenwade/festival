export default (state = null, action) => {
  switch (action.type) {
    case 'SET_TARGET_SHOW_STATUS':
      return action.targetShowStatus;

    default:
      return state;
  }
};
