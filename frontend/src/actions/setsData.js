import { addMilliseconds, addSeconds, parseISO } from 'date-fns';
import { compose } from 'redux/es/redux.mjs';

import { startTicking, stopTicking } from './targetShowStatus.js';
import { errorLoading } from './ui.js';

// In production, BUILD_ENV is set to 'production'
// This is accomplished by @rollup/plugin-replace in rollup.config.js
const BUILD_ENV = '__buildEnv__';

// In development, serve media from ./media/
// In production, serve media from Azure
export const AUDIO_PREFIX =
  BUILD_ENV === 'production'
    ? /* c8 ignore next */
      'https://sndfli.z13.web.core.windows.net/'
    : 'media/';

export const TESTING_ADJUST_TIME_IN_SECONDS = 3;
export const SETS_URL = '/media/sets.json';

const addEmptySetsArrayIfNeeded = (setsData) => ({
  sets: [],
  ...setsData,
});

const addAudioPrefixToSets = (setsData) => ({
  ...setsData,
  sets: setsData.sets.map((set) => ({
    ...set,
    audio: AUDIO_PREFIX + set.audio,
  })),
});

const addDatesToSets = (setsData) => ({
  ...setsData,
  sets: setsData.sets.map((set) => {
    const startDate = parseISO(set.start);
    return {
      ...set,
      startDate,
      endDate: addSeconds(startDate, set.length),
    };
  }),
});

const sortSetsByDate = (setsData) => ({
  ...setsData,
  sets: setsData.sets.sort((a, b) => a.startDate - b.startDate),
});

const adjustTimesForClientTimeSkew = (setsData) => {
  const clientDate = new Date();
  const { serverDate } = setsData;

  if (!serverDate) return setsData;

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
  // adjust all start times so the first set starts a few seconds
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
      startDate: addSeconds(
        addMilliseconds(set.startDate, difference),
        TESTING_ADJUST_TIME_IN_SECONDS
      ),
      endDate: addSeconds(
        addMilliseconds(set.endDate, difference),
        TESTING_ADJUST_TIME_IN_SECONDS
      ),
    })),
  };
};

export const _prepareSets = (setsData) => {
  const transform = compose(
    adjustTimesForTesting,
    adjustTimesForClientTimeSkew,
    sortSetsByDate,
    addDatesToSets,
    addAudioPrefixToSets,
    addEmptySetsArrayIfNeeded
  );
  return transform(setsData);
};

let lastDataText = null;

const loadData = async () => {
  const response = await fetch(SETS_URL);

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

  return _prepareSets(data);
};

// https://exploringjs.com/impatient-js/ch_callables.html#simulating-named-parameters
export const loadSets =
  ({ ignoreErrors = false } = {}) =>
  async (dispatch) => {
    try {
      const data = await loadData();
      if (data === null) return;

      dispatch(stopTicking());
      dispatch({ type: 'LOAD_SETS_DATA', data });
      dispatch(startTicking());
    } catch (e) {
      if (ignoreErrors) return;

      dispatch(errorLoading(e.detail));
      throw e;
    }
  };

export const updateSetMetadata = (detail) => ({
  type: 'UPDATE_SET_END_DATE',
  set: detail.set,
  duration: detail.duration,
});
