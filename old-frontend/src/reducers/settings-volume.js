export default (state = 100, action) => {
  switch (action.type) {
    case 'SET_VOLUME':
      return action.volume;

    default:
      return state;
  }
};
