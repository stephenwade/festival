import { expect } from '@open-wc/testing';

import { store } from '../../src/store.js';
import {
  audioEnded,
  audioPlaying,
  audioPaused,
  audioStalled,
  audioWaiting,
} from '../../src/actions/audioStatus.js';

const getState = () => store.getState().audioStatus;
const initialState = { ...getState() };

describe('audioStatus', () => {
  describe('initial state', () => {
    it('is not waiting', () => {
      expect(initialState.waiting).to.equal(false);
    });

    it('is not stalled', () => {
      expect(initialState.stalled).to.equal(false);
    });

    it('is not paused', () => {
      expect(initialState.paused).to.equal(false);
    });
  });

  describe('audioEnded action creator', () => {
    it('resets the audio status', () => {
      store.dispatch(audioEnded());
      expect(getState()).to.deep.equal(initialState);
    });
  });

  describe('audioPlaying action creator', () => {
    it('resets the audio status', () => {
      store.dispatch(audioPlaying());
      expect(getState()).to.deep.equal(initialState);
    });
  });

  describe('audioPaused action creator', () => {
    it('marks the audio status as paused', () => {
      store.dispatch(audioPaused());
      expect(getState().paused).to.equal(true);
    });
  });

  describe('audioStalled action creator', () => {
    it('marks the audio status as stalled', () => {
      store.dispatch(audioStalled());
      expect(getState().stalled).to.equal(true);
    });
  });

  describe('audioWaiting action creator', () => {
    it('marks the audio status as waiting', () => {
      store.dispatch(audioWaiting());
      expect(getState().waiting).to.equal(true);
    });
  });
});
