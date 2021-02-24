import { expect, waitUntil } from '@open-wc/testing';
import fetchMock from 'fetch-mock/esm/client.js';
import { addSeconds, formatDistanceToNowStrict, subSeconds } from 'date-fns';

import { store, resetStore } from '../../src/store.js';
import { loadSets, SETS_URL } from '../../src/actions/setsData.js';
import {
  setTargetShowStatus,
  startTicking,
  stopTicking,
  tick,
} from '../../src/actions/targetShowStatus.js';

const getState = () => store.getState().targetShowStatus;
const initialState = getState();

const getMockDataAtOffset = (offsetSec = 0) => {
  const now = new Date();

  const data = {
    sets: [
      {
        audio: 'sample/energy-fix.mp3',
        artist: 'Computer Music All‑stars',
        start: addSeconds(now, 0 - offsetSec).toISOString(),
        length: 181.34,
      },
      {
        audio: 'sample/bust-this-bust-that.mp3',
        artist: 'Professor Kliq',
        start: addSeconds(now, 250 - offsetSec).toISOString(),
        length: 268.64,
      },
      {
        audio: 'sample/one-ride.mp3',
        artist: "'Etikit",
        start: addSeconds(now, 550 - offsetSec).toISOString(),
        length: 183.72,
      },
    ],
  };

  return {
    ...data,
    adjustTimesForTesting: false,
    cacheBust: Math.random(),
  };
};

const loadSetsAtOffset = async (offsetSec) => {
  const mockData = getMockDataAtOffset(offsetSec);
  fetchMock.getOnce(SETS_URL, {
    body: mockData,
    headers: { date: new Date().toUTCString() },
  });

  store.dispatch(loadSets());
  await waitUntil(() => Array.isArray(store.getState().setsData.sets));

  // loadSets also sets the target audio status
  // so we clear it to test our function separately
  store.dispatch({
    type: 'SET_TARGET_SHOW_STATUS',
    targetShowStatus: null,
  });
  expect(getState()).to.be.null;

  return mockData;
};

afterEach(() => {
  fetchMock.reset();
  store.dispatch(resetStore());
});

describe('target show status', () => {
  describe('initial state', () => {
    it('is null', () => {
      expect(initialState).to.be.null;
    });
  });

  const setTargetShowStatusTests = (testFn) => {
    describe('1 minute before the show', () => {
      it('waiting for the first set', async () => {
        const mockData = await loadSetsAtOffset(-60);

        store.dispatch(testFn());

        const state = getState();
        expect(state.status).to.equal('WAITING_UNTIL_START');
        expect(state.secondsUntilSet).to.be.within(60, 61);
        expect(state.set.artist).to.equal(mockData.sets[0].artist);
        expect(state.nextSet.artist).to.equal(mockData.sets[1].artist);
      });
    });

    [60, 120, 180].forEach((offsetSec) => {
      const distance = formatDistanceToNowStrict(
        subSeconds(new Date(), offsetSec)
      );
      describe(`${distance} into the show`, () => {
        it('playing the first set', async () => {
          const mockData = await loadSetsAtOffset(offsetSec);

          store.dispatch(testFn());

          const state = getState();
          expect(state.status).to.equal('PLAYING');
          expect(state.currentTime).to.be.within(offsetSec - 1, offsetSec);
          expect(state.set.artist).to.equal(mockData.sets[0].artist);
          expect(state.nextSet.artist).to.equal(mockData.sets[1].artist);
        });
      });
    });

    describe('4 minutes into the show', () => {
      it('waiting for the second set', async () => {
        const mockData = await loadSetsAtOffset(240);

        store.dispatch(testFn());

        const state = getState();
        expect(state.status).to.equal('WAITING_UNTIL_START');
        expect(state.secondsUntilSet).to.be.within(10, 11);
        expect(state.set.artist).to.equal(mockData.sets[1].artist);
        expect(state.nextSet.artist).to.equal(mockData.sets[2].artist);
      });
    });

    [300, 360, 420, 480].forEach((offsetSec) => {
      const distance = formatDistanceToNowStrict(
        subSeconds(new Date(), offsetSec)
      );
      describe(`${distance} into the show`, () => {
        it('playing the second set', async () => {
          const mockData = await loadSetsAtOffset(offsetSec);

          store.dispatch(testFn());

          const state = getState();
          expect(state.status).to.equal('PLAYING');
          expect(state.currentTime).to.be.within(
            offsetSec - 250 - 1,
            offsetSec - 250
          );
          expect(state.set.artist).to.equal(mockData.sets[1].artist);
          expect(state.nextSet.artist).to.equal(mockData.sets[2].artist);
        });
      });
    });

    describe('9 minutes into the show', () => {
      it('waiting for the last set', async () => {
        const mockData = await loadSetsAtOffset(540);

        store.dispatch(testFn());

        const state = getState();
        expect(state.status).to.equal('WAITING_UNTIL_START');
        expect(state.secondsUntilSet).to.be.within(10, 11);
        expect(state.set.artist).to.equal(mockData.sets[2].artist);
        expect(state.nextSet).to.be.null;
      });
    });

    [600, 660, 720].forEach((offsetSec) => {
      const distance = formatDistanceToNowStrict(
        subSeconds(new Date(), offsetSec)
      );
      describe(`${distance} into the show`, () => {
        it('playing the last set', async () => {
          const mockData = await loadSetsAtOffset(offsetSec);

          store.dispatch(testFn());

          const state = getState();
          expect(state.status).to.equal('PLAYING');
          expect(state.currentTime).to.be.within(
            offsetSec - 550 - 1,
            offsetSec - 550
          );
          expect(state.set.artist).to.equal(mockData.sets[2].artist);
          expect(state.nextSet).to.be.null;
        });
      });
    });

    describe('after the show', () => {
      it('ended', async () => {
        await loadSetsAtOffset(780);

        store.dispatch(testFn());

        const state = getState();
        expect(state.status).to.equal('ENDED');
        expect(state.set).to.be.null;
        expect(state).to.not.have.property('nextSet');
      });
    });
  };

  describe('setTargetShowStatus action creator', () => {
    setTargetShowStatusTests(setTargetShowStatus);
  });

  describe('startTicking action creator', () => {
    describe('calls setTargetShowStatus', () => {
      setTargetShowStatusTests(tick);
    });

    it('starts the clock', async () => {
      try {
        store.dispatch(startTicking());
      } catch (e) {
        // ignore errors in setTargetShowStatus
      }

      expect(store.getState().clock.ticking, 'clock ticking').to.be.true;
    });
  });

  describe('tick action creator', () => {
    describe('calls setTargetShowStatus', () => {
      setTargetShowStatusTests(tick);
    });

    it('stops the clock if the show has ended', async () => {
      await loadSetsAtOffset(780);

      store.dispatch(setTargetShowStatus());
      expect(getState().status).to.equal('ENDED');

      store.dispatch(tick());
      expect(store.getState().clock.ticking, 'clock ticking').to.be.false;
    });
  });

  describe('stopTicking action creator', () => {
    it('stops the clock', () => {
      try {
        store.dispatch(startTicking());
      } catch (e) {
        // ignore errors in setTargetShowStatus
      }
      expect(store.getState().clock.ticking, 'clock ticking').to.be.true;

      store.dispatch(stopTicking());
      expect(store.getState().clock.ticking, 'clock ticking').to.be.false;
    });
  });
});
