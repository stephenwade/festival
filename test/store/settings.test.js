import { expect } from '@open-wc/testing';

import { store } from '../../src/store.js';
import { setVolume, setLastUnmutedVolume } from '../../src/actions/settings.js';

const getState = () => store.getState().settings;
const initialState = { ...getState() };

describe('settings', () => {
  describe('initial state', () => {
    it('has a volume', () => {
      expect(initialState).to.have.property('volume');
    });

    it('has a last unmuted volume', () => {
      expect(initialState).to.have.property('lastUnmutedVolume');
    });
  });

  describe('setVolume action creator', () => {
    it('sets the volume', () => {
      [25, 50, 75].forEach((v) => {
        store.dispatch(setVolume(v));
        expect(getState().volume).to.equal(v);
      });
    });
  });

  describe('setLastUnmutedVolume action creator', () => {
    it('sets the last unmuted volume', () => {
      [25, 50, 75].forEach((v) => {
        store.dispatch(setLastUnmutedVolume(v));
        expect(getState().lastUnmutedVolume).to.equal(v);
      });
    });
  });
});
