import {
  createStore,
  combineReducers,
  compose,
  applyMiddleware,
} from 'redux/es/redux.mjs';
import thunk from 'redux-thunk';

import setsDataReducer from './reducers/setsData.js';
import uiReducer from './reducers/ui.js';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export const store = createStore(
  combineReducers({
    setsData: setsDataReducer,
    ui: uiReducer,
  }),
  composeEnhancers(applyMiddleware(thunk))
);
