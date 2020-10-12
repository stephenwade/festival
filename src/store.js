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
  return undefined;
};
const preloadedState = { settings: getSettingsFromLocalStorage() || {} };

export const store = createStore(
  combineReducers({
    clock: clockReducer,
    setsData: setsDataReducer,
    targetShowStatus: targetShowStatusReducer,
    showStatus: showStatusReducer,
    audioStatus: audioStatusReducer,
    ui: uiReducer,
    settings: settingsReducer,
  }),
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
