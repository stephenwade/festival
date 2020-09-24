import { addMilliseconds, addSeconds } from 'date-fns';
import { compose } from 'redux/es/redux.mjs';

import { startTicking, stopTicking } from './targetShowStatus.js';

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
      audio: audioPrefix + set.audio,
    })),
  };
};

const addDatesToSets = (setsData) => {
  return {
    ...setsData,
    sets: setsData.sets.map((set) => {
      const startDate = new Date(set.start);
      return {
        ...set,
        startDate,
        endDate: addSeconds(startDate, set.length),
      };
    }),
  };
};

const sortSetsByDate = (setsData) => {
  return {
    ...setsData,
    sets: setsData.sets.sort((a, b) => a.startDate - b.startDate),
  };
};

const adjustTimesForTesting = (setsData) => {
  // adjust all start times so the first set starts 5 seconds
  // after the page is loaded

  if (!setsData.adjustTimesForTesting) return setsData;

  const { sets } = setsData;
  const firstSet = sets[0];
  if (!firstSet) return setsData;

  const now = new Date();
  const difference = now - firstSet.startDate;
  return {
    ...setsData,
    sets: setsData.sets.map((set) => ({
      ...set,
      startDate: addSeconds(addMilliseconds(set.startDate, difference), 5),
      endDate: addSeconds(addMilliseconds(set.endDate, difference), 5),
    })),
  };
};

const prepareSets = (setsData) => {
  const transform = compose(
    adjustTimesForTesting,
    sortSetsByDate,
    addDatesToSets,
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
    dispatch(startTicking());
    return data;
  } catch (e) {
    dispatch({ type: 'ERROR_LOADING', detail: e.detail });
    throw e;
  }
};

export const updateSetMetadata = (detail) => ({
  type: 'UPDATE_SET_END_DATE',
  set: detail.set,
  duration: detail.duration,
});
