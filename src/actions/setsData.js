import moment from 'moment/src/moment.js';
import { compose } from 'redux/es/redux.mjs';

import { startTicking, stopTicking } from './clock.js';
import { setInitialTargetShowStatus } from './targetShowStatus.js';

const addAudioPrefixToSets = (setsData) => {
  // In production, BUILD_ENV is set to 'production'
  // This is accomplished by @rollup/plugin-replace in rollup.config.js
  const BUILD_ENV = '__buildEnv__';

  // In development, serve media from ./media/
  // In production, serve media from Azure
  const audioPrefix =
    BUILD_ENV === 'production'
      ? 'https://sndfli.z13.web.core.windows.net/'
      : 'media/';

  return {
    ...setsData,
    sets: setsData.sets.map((set) => ({
      ...set,
      audio: set.audio && audioPrefix + set.audio,
    })),
  };
};

const addMomentsToSets = (setsData) => {
  return {
    ...setsData,
    sets: setsData.sets.map((set) => ({
      ...set,
      startMoment: moment(set.start),
      endMoment: moment(set.start).clone().add(set.length, 'seconds'),
    })),
  };
};

const sortSetsByMoment = (setsData) => {
  return {
    ...setsData,
    sets: setsData.sets.sort((a, b) => a.startMoment - b.startMoment),
  };
};

const adjustTimesForTesting = (setsData) => {
  // adjust all start times so the first set starts 5 seconds
  // after the page is loaded

  if (!setsData.adjustTimesForTesting) return setsData;

  const sets = setsData.sets;
  const firstSet = sets[0];
  if (!firstSet) return setsData;

  const now = moment();
  const difference = now.diff(firstSet.startMoment);
  sets.forEach((set) => {
    [set.startMoment, set.endMoment].forEach((m) =>
      m.add(difference).add(5, 'seconds')
    );
  });

  return setsData;
};

const prepareSets = (setsData) => {
  const transform = compose(
    adjustTimesForTesting,
    sortSetsByMoment,
    addMomentsToSets,
    addAudioPrefixToSets
  );
  return transform(setsData);
};

const loadData = async () => {
  const response = await window.fetch('media/sets.json');

  if (!response.ok)
    throw new Error(`Response: ${response.status} ${response.statusText}`);

  const data = await response.json();

  return prepareSets(data);
};

export const loadSets = () => async (dispatch) => {
  try {
    const data = await loadData();
    dispatch(stopTicking());
    dispatch({ type: 'LOAD_SETS_DATA', data });
    dispatch(setInitialTargetShowStatus());
    dispatch(startTicking());
    return data;
  } catch (e) {
    dispatch({ type: 'ERROR_LOADING', detail: e.detail });
    throw e;
  }
};

export const updateSetMetadata = (detail) => ({
  type: 'UPDATE_SET_END_MOMENT',
  set: detail.set,
  duration: detail.duration,
});
