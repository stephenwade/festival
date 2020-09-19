import { setInitialTargetShowStatus } from './targetShowStatus.js';

export const startTicking = () => (dispatch) => {
  dispatch(setInitialTargetShowStatus());
  dispatch({ type: 'CLOCK_START_TICKING' });
};

export const stopTicking = () => ({
  type: 'CLOCK_STOP_TICKING',
});
