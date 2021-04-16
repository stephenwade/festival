import { expect } from '@open-wc/testing';

import { store } from '../../src/store.js';
import { errorLoading } from '../../src/actions/ui.js';

const getState = () => store.getState().ui;
const initialState = { ...getState() };

describe('ui', () => {
  describe('initial state', () => {
    it('is not in error state', () => {
      expect(initialState.errorLoading).to.be.false;
    });
  });

  describe('errorLoading action creator', () => {
    it('sets the ui to error state', () => {
      store.dispatch(errorLoading());
      expect(getState().errorLoading).to.be.true;
    });
  });
});
