import { expect, aTimeout, waitUntil } from '@open-wc/testing';
import fetchMock from 'fetch-mock/esm/client.js';
import {
  addMilliseconds,
  addSeconds,
  differenceInSeconds,
  isEqual,
  parseISO,
  subSeconds,
} from 'date-fns';

import { store, resetStoreForTesting } from '../../src/store.js';
import {
  AUDIO_PREFIX,
  loadSets,
  SETS_URL,
  TESTING_ADJUST_TIME_IN_SECONDS,
  updateSetMetadata,
} from '../../src/actions/setsData.js';
import { getMockData } from './mockData.js';

const getState = () => store.getState().setsData;
const initialState = { ...getState() };

describe('audioStatus', () => {
  describe('initial state', () => {
    it('is empty', () => {
      expect(initialState).to.deep.equal({});
    });
  });

  describe('loadSets action creator', () => {
    afterEach(() => {
      fetchMock.reset();
      store.dispatch(resetStoreForTesting());
    });

    describe('not in testing mode', () => {
      beforeEach(() => {
        fetchMock.getOnce(SETS_URL, getMockData());
      });

      it('returns sets', async () => {
        store.dispatch(loadSets());
        await waitUntil(() => Array.isArray(getState().sets));

        expect(getState().sets).to.have.lengthOf(getMockData().sets.length);
      });

      it('adds startDate and endDate to sets', async () => {
        store.dispatch(loadSets());
        await waitUntil(() => Array.isArray(getState().sets));

        for (const set of getState().sets) {
          for (const p of ['startDate', 'endDate']) {
            expect(set).to.have.property(p);
            expect(set[p]).to.be.an.instanceof(Date);
          }

          expect(Math.floor(set.length), 'set length').to.equal(
            differenceInSeconds(set.endDate, set.startDate)
          );
        }
      });

      it('sorts sets by date', async () => {
        store.dispatch(loadSets());
        await waitUntil(() => Array.isArray(getState().sets));

        const state = getState();
        const sortedDates = state.sets
          .map((set) => set.startDate)
          .sort((a, b) => a - b);
        const actualDates = state.sets.map((set) => set.startDate);

        expect(actualDates, 'set dates').to.deep.equal(sortedDates);
      });

      it('adjusts sets start time based on server clock', async () => {
        store.dispatch(loadSets());
        await waitUntil(() => Array.isArray(getState().sets));

        const state = getState();
        expect(state).to.have.property('serverDate');
        expect(state.serverDate).to.be.an.instanceof(Date);

        for (const set of state.sets) {
          const clientDate = new Date();
          const { serverDate } = state;
          const clientTimeSkewMs = clientDate - serverDate;

          const expectedDate = addMilliseconds(
            parseISO(set.start),
            clientTimeSkewMs
          );
          expect(set.startDate, 'set start date').to.be.within(
            subSeconds(expectedDate, 1),
            expectedDate
          );
        }
      });

      it('adds the audio prefix to the set URLs', async () => {
        store.dispatch(loadSets());
        await waitUntil(() => Array.isArray(getState().sets));

        for (const set of getState().sets) {
          expect(
            set.audio.startsWith(AUDIO_PREFIX),
            'set.audio starts with AUDIO_PREFIX'
          ).to.be.true;
        }
      });

      it('stops and starts the clock', async () => {
        const getClockState = () => store.getState().clock;

        store.dispatch({ type: 'CLOCK_START_TICKING' });
        expect(getClockState().ticking).to.be.true;

        let stopped = false;
        const unsubscribe = store.subscribe(() => {
          if (!getClockState().ticking) stopped = true;
        });

        store.dispatch(loadSets());
        await waitUntil(() => stopped === true, "Clock didn't stop");
        await waitUntil(
          () => getClockState().ticking === true,
          'Clock is not running'
        );
        unsubscribe();
      });
    });

    describe('testing mode', () => {
      beforeEach(() => {
        fetchMock.getOnce(SETS_URL, getMockData(/* adjustTimes */ true));
      });

      it('adjusts the start times so the show starts within a few seconds', async () => {
        store.dispatch(loadSets());
        await waitUntil(() => Array.isArray(getState().sets));

        const state = getState();
        const firstSet = state.sets.shift();

        const expectedFirstDate = addSeconds(
          new Date(),
          TESTING_ADJUST_TIME_IN_SECONDS
        );
        expect(firstSet.startDate, 'first set start date').to.be.within(
          subSeconds(expectedFirstDate, 1),
          expectedFirstDate
        );

        const expectedDifference =
          firstSet.startDate - parseISO(firstSet.start);
        for (const set of state.sets) {
          const expectedStartDate = addMilliseconds(
            parseISO(set.start),
            expectedDifference
          );
          expect(set.startDate, 'set start date').to.deep.equal(
            expectedStartDate
          );

          const expectedEndDate = addSeconds(expectedStartDate, set.length);
          expect(set.endDate, 'set end date').to.deep.equal(expectedEndDate);
        }
      });
    });

    it('handles empty sets array not in testing mode', async () => {
      fetchMock.getOnce(SETS_URL, { sets: [] });

      store.dispatch(loadSets());
      await waitUntil(() => Array.isArray(getState().sets));
    });

    it('handles empty sets array in testing mode', async () => {
      fetchMock.getOnce(SETS_URL, { sets: [], adjustTimesForTesting: true });

      store.dispatch(loadSets());
      await waitUntil(() => Array.isArray(getState().sets));
    });

    it('handles empty JSON object', async () => {
      fetchMock.getOnce(SETS_URL, {});

      store.dispatch(loadSets());
      await waitUntil(() => Array.isArray(getState().sets));
    });

    it('enters error state when fetch fails', async () => {
      fetchMock.getOnce(SETS_URL, 400);

      store.dispatch(loadSets());
      await waitUntil(() => store.getState().ui.errorLoading);
    });

    it('does not enter error state when fetch fails if ignoreErrors is true', async () => {
      fetchMock.getOnce(SETS_URL, 400);

      store.dispatch(loadSets({ ignoreErrors: true }));
      await aTimeout(500);
      expect(store.getState().ui.errorLoading, 'error loading').to.be.false;
    });

    it("ignores sets data if it hasn't changed", async () => {
      const mockData = getMockData();
      fetchMock.get(SETS_URL, mockData);

      store.dispatch(loadSets());
      await waitUntil(() => Array.isArray(getState().sets));

      store.dispatch(resetStoreForTesting());

      store.dispatch(loadSets());
      await aTimeout(500);
      expect(getState()).to.deep.equal(initialState);
    });
  });

  describe('updateSetMetadata action creator', () => {
    beforeEach(async () => {
      fetchMock.getOnce(SETS_URL, getMockData());

      store.dispatch(loadSets());
      await waitUntil(() => Array.isArray(getState().sets));
    });

    afterEach(() => {
      fetchMock.reset();

      store.dispatch(resetStoreForTesting());
    });

    it('updates the length of the set', async () => {
      const set = getState().sets[0];
      const duration = 10;

      store.dispatch(updateSetMetadata({ set, duration }));
      await waitUntil(() => getState().sets[0].length === duration);
    });

    it('updates the end date of the set', async () => {
      const set = getState().sets[0];
      const duration = 10;

      store.dispatch(updateSetMetadata({ set, duration }));
      await waitUntil(() => {
        const setToCheck = getState().sets[0];
        return isEqual(
          setToCheck.endDate,
          addSeconds(setToCheck.startDate, duration)
        );
      });
    });

    it("doesn't change any other sets", async () => {
      const oldState = getState();

      const set = oldState.sets[0];
      const duration = 10;

      store.dispatch(updateSetMetadata({ set, duration }));
      await waitUntil(() => getState().sets[0].length === duration);

      const newState = getState();

      oldState.sets.shift();
      newState.sets.shift();
      expect(oldState.sets).to.deep.equal(newState.sets);
    });
  });
});
