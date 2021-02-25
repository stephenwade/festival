import { expect, waitUntil } from '@open-wc/testing';
import fetchMock from 'fetch-mock/esm/client.js';

import { store, resetStoreForTesting } from '../../src/store.js';
import { loadSets, SETS_URL } from '../../src/actions/setsData.js';
import { stopTicking } from '../../src/actions/targetShowStatus.js';

import { getMockData } from './setsData.test.js';

const getState = () => store.getState().clock;
const initialState = { ...getState() };

describe('clock', () => {
  describe('initial state', () => {
    it('is not ticking', () => {
      expect(initialState.ticking).to.be.false;
    });
  });

  describe('targetShowStatus initial state', () => {
    it('is null', () => {
      expect(store.getState().targetShowStatus).to.be.null;
    });
  });

  describe('startTicking action creator', () => {
    beforeEach(async () => {
      fetchMock.getOnce(SETS_URL, getMockData());
    });

    afterEach(() => {
      fetchMock.reset();
      store.dispatch(resetStoreForTesting());
    });

    it('starts ticking', async () => {
      store.dispatch(loadSets()); // loadSets calls startTicking
      await waitUntil(() => getState().ticking === true);
    });

    it('sets the target audio status', async () => {
      expect(store.getState().targetShowStatus, 'target show status').to.be
        .null;

      store.dispatch(loadSets()); // loadSets calls startTicking
      await waitUntil(() => store.getState().targetShowStatus !== null);
    });
  });

  describe('stopTicking action creator', () => {
    it('stops ticking', () => {
      store.dispatch(stopTicking());
      expect(getState().ticking).to.be.false;
    });
  });
});
