export default (state = {}, action) => {
  switch (action.type) {
    case 'LOAD_SETS_DATA':
      return action.data;

    case 'UPDATE_SET_END_MOMENT': {
      for (const set of state.sets) {
        if (set.audio === action.set.audio) {
          set.length = action.duration;
          set.endMoment = set.startMoment.clone().add(set.length, 'seconds');
        }
      }
      return state;
    }

    default:
      return state;
  }
};
