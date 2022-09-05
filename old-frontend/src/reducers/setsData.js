import { addSeconds } from 'date-fns';

export default (state = {}, action) => {
  switch (action.type) {
    case 'LOAD_SETS_DATA':
      return action.data;

    case 'UPDATE_SET_END_DATE': {
      for (const set of state.sets) {
        if (set.audio === action.set.audio) {
          set.length = action.duration;
          set.endDate = addSeconds(set.startDate, set.length);
        }
      }
      return state;
    }

    default:
      return state;
  }
};
