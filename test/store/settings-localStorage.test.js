import { expect } from '@open-wc/testing';

import { setVolume, setLastUnmutedVolume } from '../../src/actions/settings.js';

describe('settings with localStorage', () => {
  it('loads settings from localStorage', async () => {
    const testSettings = {
      volume: 85,
      lastUnmutedVolume: 20,
    };
    localStorage.setItem('festival-settings', JSON.stringify(testSettings));

    const { store } = await import('../../src/store.js');
    const getState = () => store.getState().settings;

    expect(getState()).to.deep.equal(testSettings);
  }).timeout(5000);

  it('stores settings in localStorage', async () => {
    const testSettings = {
      volume: 75,
      lastUnmutedVolume: 55,
    };

    const { store } = await import('../../src/store.js');

    store.dispatch(setVolume(testSettings.volume));
    store.dispatch(setLastUnmutedVolume(testSettings.lastUnmutedVolume));

    expect(
      JSON.parse(localStorage.getItem('festival-settings')),
      'settings from localStorage'
    ).to.deep.equal(testSettings);
  }).timeout(5000);
});
