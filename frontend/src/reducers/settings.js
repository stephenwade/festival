// This reducer is a combined reducer because it makes using preloadedState
// easier in the store. It means that future settings reducers can be added
// without requiring any complicated logic to merge the old structure and
// the new structure.
// https://redux.js.org/recipes/structuring-reducers/initializing-state#recap

import { combineReducers } from 'redux/es/redux.mjs';

import volumeReducer from './settings-volume.js';
import lastUnmutedVolumeReducer from './settings-lastUnmutedVolume.js';

export default combineReducers({
  volume: volumeReducer,
  lastUnmutedVolume: lastUnmutedVolumeReducer,
});
