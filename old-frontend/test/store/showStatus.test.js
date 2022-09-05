import { expect } from '@open-wc/testing';

import { setShowStatus } from '../../src/actions/showStatus.js';
import { store } from '../../src/store.js';

const getState = () => store.getState().showStatus;
const initialState = { ...getState() };

describe('showStatus', () => {
  describe('initial state', () => {
    it('is waiting for audio status', () => {
      expect(initialState.status).to.equal('WAITING_FOR_AUDIO_CONTEXT');
    });
  });

  describe('setShowStatus action creator', () => {
    it('sets the show status to exactly what is passed in', () => {
      [
        'WAITING_UNTIL_START',
        'DELAYING_FOR_INITIAL_SYNC',
        'PLAYING',
        'ENDED',
      ].forEach((status) => {
        const showStatus = { status };
        store.dispatch(setShowStatus(showStatus));
        expect(getState()).to.deep.equal(showStatus);
      });
    });
  });
});
