import {
  createStore,
  combineReducers,
  compose,
  applyMiddleware,
} from 'redux/es/redux.mjs';
import thunk from 'redux-thunk';

import clockReducer from './reducers/clock.js';
import setsDataReducer from './reducers/setsData.js';
import targetShowStatusReducer from './reducers/targetShowStatus.js';
import showStatusReducer from './reducers/showStatus.js';
import audioStatusReducer from './reducers/audioStatus.js';
import uiReducer from './reducers/ui.js';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export const store = createStore(
  combineReducers({
    clock: clockReducer,
    setsData: setsDataReducer,
    targetShowStatus: targetShowStatusReducer,
    showStatus: showStatusReducer,
    audioStatus: audioStatusReducer,
    ui: uiReducer,
  }),
  composeEnhancers(applyMiddleware(thunk))
);
