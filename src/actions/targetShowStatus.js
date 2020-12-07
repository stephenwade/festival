import { isAfter, isBefore } from 'date-fns';

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

export const setInitialTargetShowStatus = () => (dispatch, getState) => {
  const { setsData } = getState();

  const now = new Date();
  const initialSet = getInitialSet(now, setsData.sets);

  dispatch(setTargetShowStatusForSet(initialSet, setsData.sets, now));
};

const setTargetShowStatus = () => (dispatch, getState) => {
  const { targetShowStatus, setsData } = getState();

  if (targetShowStatus.status === 'ENDED') {
    // eslint-disable-next-line no-use-before-define
    dispatch(stopTicking());
    return;
  }

  const now = new Date();

  let { set } = targetShowStatus;
  if (isAfter(now, set.endDate)) set = getNextSet(set, setsData.sets);

  dispatch(setTargetShowStatusForSet(set, setsData.sets, now));
};

export const tick = () => setTargetShowStatus();

export const startTicking = () => (dispatch) => {
  dispatch(setInitialTargetShowStatus());
  dispatch({ type: 'CLOCK_START_TICKING' });
};

export const stopTicking = () => ({
  type: 'CLOCK_STOP_TICKING',
});
