import {
  aTimeout,
  elementUpdated,
  expect,
  fixture,
  html,
  oneEvent,
} from '@open-wc/testing';

import '../../src/components/festival-ui-playing.js';
import hashCode from './festival-audio/hashCode.js';

describe('festival-ui-playing', () => {
  describe('attributes', () => {
    const template = `<festival-ui-playing
      waitinguntilstart
      secondsuntilset="10"
      waitingfornetwork
      currenttime="185"
      audiopaused
      reducemotion
      volume="35"
    ></festival-ui-playing>`;

    it('binds to the waitinguntilstart attribute', async () => {
      const el = await fixture(template);
      expect(el.waitingUntilStart).to.be.true;
    });

    it('binds to the secondsuntilset attribute', async () => {
      const el = await fixture(template);
      expect(el.secondsUntilSet).to.equal(10);
    });

    it('binds to the waitingfornetwork attribute', async () => {
      const el = await fixture(template);
      expect(el.waitingForNetwork).to.be.true;
    });

    it('binds to the currenttime attribute', async () => {
      const el = await fixture(template);
      expect(el.currentTime).to.equal(185);
    });

    it('binds to the audiopaused attribute', async () => {
      const el = await fixture(template);
      expect(el.audioPaused).to.be.true;
    });

    it('binds to the reducemotion attribute', async () => {
      const el = await fixture(template);
      expect(el.reduceMotion).to.be.true;
    });

    it('binds to the volume attribute', async () => {
      const el = await fixture(template);
      expect(el.volume).to.equal(35);
    });
  });

  describe('volume', () => {
    const template = '<festival-ui-playing volume="35"></festival-ui-playing>';

    it('sets the volume on the volume button when its volume property changes', async () => {
      const el = await fixture(template);
      const volumeButton = el.shadowRoot.querySelector('fab-volume-button');

      expect(volumeButton).to.have.property('volume', 35);

      el.volume = 80;
      await elementUpdated(el);
      expect(volumeButton).to.have.property('volume', 80);
    });

    it('updates its volume property when it receives a volume input event', async () => {
      const el = await fixture(template);
      const volumeButton = el.shadowRoot.querySelector('fab-volume-button');

      volumeButton.volume = 80;
      setTimeout(() => volumeButton._dispatchVolumeEvent('volumeinput'));
      await oneEvent(volumeButton, 'volumeinput');
      expect(el).to.have.property('volume', 80);
    });
  });

  describe('while waiting until start', () => {
    const template = html`<festival-ui-playing
      .set="${{ artist: 'Fulton' }}"
      waitinguntilstart
      secondsuntilset="10"
      volume="35"
    ></festival-ui-playing>`;

    it('includes the words "Next up"', async () => {
      const el = await fixture(template);
      expect(el.shadowRoot).to.contain.text('Next up');
    });

    it('includes the artist name', async () => {
      const el = await fixture(template);
      expect(el.shadowRoot).to.contain.text('Fulton');
    });

    it('includes minutes and seconds', async () => {
      const el = await fixture(template);

      expect(el.shadowRoot).to.contain.text('0:10');

      el.secondsUntilSet = 165;
      await elementUpdated(el);
      expect(el.shadowRoot).to.contain.text('2:45');
    });

    it('includes hours if there is an hour or more until the set', async () => {
      const el = await fixture(template);

      expect(el.shadowRoot).to.not.contain.text('0:00:10');

      el.secondsUntilSet = 165 + 3600;
      await elementUpdated(el);
      expect(el.shadowRoot).to.contain.text('1:02:45');
    });
  });

  describe('while waiting for network', () => {
    const template = html`<festival-ui-playing
      .set="${{ artist: 'Evans' }}"
      waitingfornetwork
      volume="50"
    ></festival-ui-playing>`;

    it('does not include the words "Next up"', async () => {
      const el = await fixture(template);
      expect(el.shadowRoot).to.not.contain.text('Next up');
    });

    it('includes the artist name', async () => {
      const el = await fixture(template);
      expect(el.shadowRoot).to.contain.text('Evans');
    });

    it('contains a loading spinner', async () => {
      const el = await fixture(template);
      const spinner = el.shadowRoot.querySelector('loading-spinner');

      expect(spinner).to.be.an.instanceof(HTMLElement);
    });
  });

  describe('while playing', () => {
    const template = html`<festival-ui-playing
      .set="${{ artist: 'Dana' }}"
      currenttime="15"
      volume="90"
    ></festival-ui-playing>`;

    it('does not include the words "Next up"', async () => {
      const el = await fixture(template);
      expect(el.shadowRoot).to.not.contain.text('Next up');
    });

    it('includes the artist name', async () => {
      const el = await fixture(template);
      expect(el.shadowRoot).to.contain.text('Dana');
    });

    it('includes minutes and seconds', async () => {
      const el = await fixture(template);

      expect(el.shadowRoot).to.contain.text('0:15');

      el.currentTime = 295;
      await elementUpdated(el);
      expect(el.shadowRoot).to.contain.text('4:55');
    });

    it('includes hours if there is an hour or more until the set', async () => {
      const el = await fixture(template);

      expect(el.shadowRoot).to.not.contain.text('0:00:15');

      el.currentTime = 295 + 3600;
      await elementUpdated(el);
      expect(el.shadowRoot).to.contain.text('1:04:55');
    });

    it('has a canvas with something drawn on it', async () => {
      const el = await fixture(template);
      const canvas = el.shadowRoot.querySelector('canvas');

      expect(canvas).to.be.an.instanceof(HTMLCanvasElement);

      el.getAudioVisualizerData = () =>
        Uint8Array.from(new Array(512).fill(100));
      await aTimeout(100);

      expect(
        canvas
          .getContext('2d')
          .getImageData(0, 0, canvas.width, canvas.height)
          .data.some((channel) => channel !== 0),
        'canvas has some non-blank pixels'
      ).to.be.true;
    });

    describe('reduceMotion false', () => {
      it('canvas looks different with sound and no sound', async () => {
        const el = await fixture(template);
        const canvas = el.shadowRoot.querySelector('canvas');

        el.getAudioVisualizerData = () =>
          Uint8Array.from(new Array(512).fill(100));
        await aTimeout(200);
        const imageDataSound = canvas
          .getContext('2d')
          .getImageData(0, 0, canvas.width, canvas.height).data;

        el.getAudioVisualizerData = () =>
          Uint8Array.from(new Array(512).fill(0));
        await aTimeout(200);
        const imageDataNoSound = canvas
          .getContext('2d')
          .getImageData(0, 0, canvas.width, canvas.height).data;

        expect(hashCode(imageDataSound)).to.not.equal(
          hashCode(imageDataNoSound)
        );
      });
    });

    describe('reduceMotion true', () => {
      it('canvas looks identical with sound and no sound', async () => {
        const el = await fixture(template);
        const canvas = el.shadowRoot.querySelector('canvas');

        el.reduceMotion = true;

        el.getAudioVisualizerData = () =>
          Uint8Array.from(new Array(512).fill(100));
        await aTimeout(200);
        const imageDataSound = canvas
          .getContext('2d')
          .getImageData(0, 0, canvas.width, canvas.height).data;

        el.getAudioVisualizerData = () =>
          Uint8Array.from(new Array(512).fill(0));
        await aTimeout(200);
        const imageDataNoSound = canvas
          .getContext('2d')
          .getImageData(0, 0, canvas.width, canvas.height).data;

        expect(hashCode(imageDataSound)).to.equal(hashCode(imageDataNoSound));
      });
    });

    it('is accessible', async () => {
      const el = await fixture(template);
      await expect(el).to.be.accessible();
    }).timeout(3000);
  });
});
