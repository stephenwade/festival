import moment from 'moment/src/moment.js';

import { stopTicking } from './clock.js';

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

    if (now.isBefore(set.startMoment)) {
      const secondsUntilSetFrac = set.startMoment.diff(
        now,
        'seconds',
        true /* do not truncate */
      );
      const secondsUntilSet = Math.ceil(secondsUntilSetFrac);
      return newTargetShowStatus({
        set,
        secondsUntilSet,
        status: 'WAITING_UNTIL_START',
        nextSet,
      });
    }

    const currentTimeFrac = now.diff(
      set.startMoment,
      'seconds',
      true /* do not truncate */
    );
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
    if (now.isBefore(set.endMoment)) return set;
  }
  return null;
};

export const setInitialTargetShowStatus = () => (dispatch, getState) => {
  const { setsData } = getState();

  const now = moment();
  const initialSet = getInitialSet(now, setsData.sets);

  dispatch(setTargetShowStatusForSet(initialSet, setsData.sets, now));
};

const setTargetShowStatus = () => (dispatch, getState) => {
  const { targetShowStatus, setsData } = getState();

  if (targetShowStatus.status === 'ENDED') {
    dispatch(stopTicking());
    return;
  }

  const now = moment();

  let set = targetShowStatus.set;
  // make sure next set event is ready before current set ends
  const setCutoff = set.endMoment.clone().subtract(1, 'second');
  if (now.isAfter(setCutoff)) set = getNextSet(set, setsData.sets);

  dispatch(setTargetShowStatusForSet(set, setsData.sets, now));
};

export const tick = () => {
  return setTargetShowStatus();
};
