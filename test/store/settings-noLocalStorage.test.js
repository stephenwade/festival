import { expect } from '@open-wc/testing';

window.DISABLE_LOCAL_STORAGE_FOR_TESTING = true;

describe('settings without localStorage', () => {
  describe('default state', async () => {
    it('volume', async () => {
      const { store } = await import('../../src/store.js');
      const getState = () => store.getState().settings;

      expect(getState().volume).to.equal(100);
    }).timeout(5000);

    it('last unmuted volume', async () => {
      const { store } = await import('../../src/store.js');
      const getState = () => store.getState().settings;

      expect(getState().lastUnmutedVolume).to.equal(100);
    }).timeout(5000);
  });
});
