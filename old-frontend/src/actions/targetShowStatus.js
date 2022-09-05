import { isBefore } from 'date-fns';

const getNextSet = (set, sets) => {
  const setIdx = sets.indexOf(set);
  const nextSetIdx = setIdx + 1;
  if (nextSetIdx < sets.length) return sets[nextSetIdx];
  return null;
};

const newTargetShowStatus = (targetShowStatus) => ({
  type: 'SET_TARGET_SHOW_STATUS',
  targetShowStatus,
});

const setTargetShowStatusForSet = (set, sets, now) => {
  if (set) {
    const nextSet = getNextSet(set, sets);

    if (isBefore(now, set.startDate)) {
      const secondsUntilSetFrac = (set.startDate - now) / 1000;
      const secondsUntilSet = Math.ceil(secondsUntilSetFrac);
      return newTargetShowStatus({
        set,
        secondsUntilSet,
        status: 'WAITING_UNTIL_START',
        nextSet,
      });
    }

    const currentTimeFrac = (now - set.startDate) / 1000;
    const currentTime = Math.floor(currentTimeFrac);
    return newTargetShowStatus({
      set,
      currentTime,
      status: 'PLAYING',
      nextSet,
    });
  }

  return newTargetShowStatus({
    set: null,
    status: 'ENDED',
  });
};

const getInitialSet = (now, sets) => {
  for (const set of sets) {
    if (isBefore(now, set.endDate)) return set;
  }
  return null;
};

export const setTargetShowStatus = () => (dispatch, getState) => {
  const { setsData } = getState();

  const now = new Date();
  const initialSet = getInitialSet(now, setsData.sets);

  dispatch(setTargetShowStatusForSet(initialSet, setsData.sets, now));
};

export const startTicking = () => (dispatch) => {
  dispatch({ type: 'CLOCK_START_TICKING' });
  dispatch(setTargetShowStatus());
};

export const stopTicking = () => ({
  type: 'CLOCK_STOP_TICKING',
});

export const tick = () => (dispatch, getState) => {
  const { targetShowStatus } = getState();

  if (targetShowStatus && targetShowStatus.status === 'ENDED') {
    dispatch(stopTicking());
  } else {
    dispatch(setTargetShowStatus());
  }
};
