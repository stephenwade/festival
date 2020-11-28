import { addMilliseconds, addSeconds, parseISO } from 'date-fns';
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
      const startDate = parseISO(set.start);
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

const adjustTimesForClientTimeSkew = (setsData) => {
  const clientDate = new Date();
  const { serverDate } = setsData;
  const clientTimeSkewMs = clientDate - serverDate;
  return {
    ...setsData,
    sets: setsData.sets.map((set) => ({
      ...set,
      startDate: addMilliseconds(set.startDate, clientTimeSkewMs),
      endDate: addMilliseconds(set.endDate, clientTimeSkewMs),
    })),
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
    adjustTimesForClientTimeSkew,
    sortSetsByDate,
    addDatesToSets,
    addAudioPrefixToSets
  );
  return transform(setsData);
};

let lastDataText = null;

const loadData = async () => {
  const response = await window.fetch('media/sets.json');

  if (!response.ok)
    throw new Error(`Response: ${response.status} ${response.statusText}`);

  // cache data so we can tell whether it changed since last time
  const thisDataText = await response.clone().text();
  if (thisDataText === lastDataText) return null;
  lastDataText = thisDataText;

  const data = {
    ...(await response.json()),
    serverDate: new Date(response.headers.get('date')),
  };

  return prepareSets(data);
};

export const loadSets = ({ ignoreErrors }) => async (dispatch) => {
  try {
    const data = await loadData();
    if (data === null) return;

    dispatch(stopTicking());
    dispatch({ type: 'LOAD_SETS_DATA', data });
    dispatch(startTicking());
  } catch (e) {
    if (ignoreErrors) return;

    dispatch({ type: 'ERROR_LOADING', detail: e.detail });
    throw e;
  }
};

export const updateSetMetadata = (detail) => ({
  type: 'UPDATE_SET_END_DATE',
  set: detail.set,
  duration: detail.duration,
});
