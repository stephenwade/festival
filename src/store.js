import {
  createStore,
  combineReducers,
  compose,
  applyMiddleware,
} from 'redux/es/redux.mjs';
import thunk from 'redux-thunk';

import testLocalStorage from '../lib/modernizr/localstorage.js';

import clockReducer from './reducers/clock.js';
import setsDataReducer from './reducers/setsData.js';
import targetShowStatusReducer from './reducers/targetShowStatus.js';
import showStatusReducer from './reducers/showStatus.js';
import audioStatusReducer from './reducers/audioStatus.js';
import uiReducer from './reducers/ui.js';
import settingsReducer from './reducers/settings.js';

const localStorageAvailable = testLocalStorage();

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

// restore settings state from localStorage
const getSettingsFromLocalStorage = () => {
  if (localStorageAvailable) {
    const settingsString = localStorage.getItem('festival-settings');
    return JSON.parse(settingsString);
  }
  /* c8 ignore next */
  return undefined;
};
const preloadedState = { settings: getSettingsFromLocalStorage() || {} };

const appReducer = combineReducers({
  clock: clockReducer,
  setsData: setsDataReducer,
  targetShowStatus: targetShowStatusReducer,
  showStatus: showStatusReducer,
  audioStatus: audioStatusReducer,
  ui: uiReducer,
  settings: settingsReducer,
});

// https://stackoverflow.com/a/35641992
const rootReducer = (state, action) => {
  if (action.type === 'RESET_STORE') {
    return appReducer(undefined, action);
  }

  return appReducer(state, action);
};

export const resetStoreForTesting = () => ({
  type: 'RESET_STORE',
});

export const store = createStore(
  rootReducer,
  preloadedState,
  composeEnhancers(applyMiddleware(thunk))
);

// save settings state to localStorage
if (localStorageAvailable) {
  let lastSettingsString = '';
  store.subscribe(() => {
    const newSettingsString = JSON.stringify(store.getState().settings);
    if (lastSettingsString !== newSettingsString) {
      localStorage.setItem('festival-settings', newSettingsString);
      lastSettingsString = newSettingsString;
    }
  });
}
