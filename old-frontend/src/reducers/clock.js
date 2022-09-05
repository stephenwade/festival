export default (state = { ticking: false }, action) => {
  switch (action.type) {
    case 'CLOCK_START_TICKING':
      return { ticking: true };

    case 'CLOCK_STOP_TICKING':
      return { ticking: false };

    default:
      return state;
  }
};
