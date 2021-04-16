import { expect } from '@open-wc/testing';

import { store } from '../../src/store.js';
import { setVolume, setLastUnmutedVolume } from '../../src/actions/settings.js';

const getState = () => store.getState().settings;
const initialState = { ...getState() };

describe('settings', () => {
  describe('initial state', () => {
    it('volume', () => {
      expect(initialState.volume).to.equal(100);
    });

    it('last unmuted volume', () => {
      expect(initialState.lastUnmutedVolume).to.equal(100);
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

  describe('localStorage', () => {
    it('stores settings in localStorage', () => {
      expect(
        JSON.parse(localStorage.getItem('festival-settings')),
        'settings from localStorage'
      ).to.deep.equal(getState());
    });
  });
});
