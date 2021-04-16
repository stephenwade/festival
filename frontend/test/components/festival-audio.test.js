import { aTimeout, expect, nextFrame, oneEvent } from '@open-wc/testing';
import {
  fixture,
  fixtureCleanup,
} from '@open-wc/testing-helpers/index-no-side-effects.js';
import { executeServerCommand } from '@web/test-runner-commands';
import { addSeconds as add } from 'date-fns';

import '../../src/components/festival-audio.js';
import { store, resetStoreForTesting } from '../../src/store.js';
import { _prepareSets as prepareSets } from '../../src/actions/setsData.js';
import { tick } from '../../src/actions/targetShowStatus.js';
import hashCode from './festival-audio/hashCode.js';

const AUDIO_FILE_URL = '../test/components/festival-audio/90-sec-silence.mp3';
const AUDIO_FILE_LENGTH = 90;

describe('festival-audio', () => {
  const loadSets = ({ addSeconds = 5, alternate = false } = {}) => {
    const now = new Date();

    const data = {
      sets: [
        {
          audio: `${AUDIO_FILE_URL}?${alternate ? 3 : 1}`,
          artist: `Artist ${alternate ? 3 : 1}`,
          start: add(now, addSeconds).toISOString(),
          length: AUDIO_FILE_LENGTH,
        },
        {
          audio: `${AUDIO_FILE_URL}?${alternate ? 4 : 2}`,
          artist: `Artist ${alternate ? 4 : 2}`,
          start: add(now, addSeconds + 100).toISOString(),
          length: AUDIO_FILE_LENGTH,
        },
      ],
    };

    return {
      type: 'LOAD_SETS_DATA',
      data: prepareSets(data),
    };
  };

  const expectAudioIsPlaying = (audio, message) => {
    expect(
      audio.currentTime > 0 && !audio.paused,
      `audio element is playing${message ? ` ${message}` : ''}`
    ).to.be.true;
  };

  const expectAudioIsNotPlaying = (audio, message) => {
    expect(
      audio.currentTime > 0 && !audio.paused,
      `audio element is playing${message ? ` ${message}` : ''}`
    ).to.be.false;
  };

  const expectNumbersAreAlmostEqual = (
    first,
    second,
    { tolerance = 0.5 } = {}
  ) => {
    expect(first).to.satisfy(
      (num) => Math.abs(num - second) <= tolerance,
      `${first} is not almost equal to ${second} (tolerance ${tolerance})`
    );
  };

  const commonTests = (template) => {
    describe('HTMLAudioElement', () => {
      afterEach(() => {
        fixtureCleanup();
      });

      it('can set arbitrary properties', async () => {
        const audio = await fixture('<audio></audio>');

        audio.mySrc = 'test value';
        expect(audio).to.have.property('mySrc', 'test value');
      });
    });

    describe('render', () => {
      afterEach(() => {
        fixtureCleanup();
      });

      it('contains two audio elements', async () => {
        const el = await fixture(template);
        await nextFrame();
        const audios = el.shadowRoot.querySelectorAll('audio');

        expect(audios).to.have.lengthOf(2);
        audios.forEach((audio) => {
          expect(audio).to.have.attribute('crossorigin', 'anonymous');
        });
      });

      it('renders a button if the showinitbutton attribute is set', async () => {
        expect(template).to.have.string('showinitbutton');

        const el = await fixture(template);
        await nextFrame();
        expect(el.shadowRoot.querySelector('button')).to.be.an.instanceof(
          HTMLElement
        );
      });

      it('does not render a button if the showinitbutton attribute is not set', async () => {
        expect(template).to.have.string('showinitbutton');

        const el = await fixture(template.replace('showinitbutton', ''));
        await nextFrame();
        expect(el.shadowRoot.querySelector('button')).to.be.null;
      });
    });

    describe('init', () => {
      beforeEach(() => {
        store.dispatch(loadSets());
        store.dispatch(tick());
      });

      afterEach(() => {
        fixtureCleanup();
        store.dispatch(resetStoreForTesting());
      });

      it('sets the show status', async () => {
        await fixture(template);
        await nextFrame();
        await executeServerCommand('click', 'festival-audio'); // calls el.init()
        await aTimeout(100);

        const { showStatus } = store.getState();
        expect(showStatus.status).to.equal('WAITING_UNTIL_START');
      });
    });

    describe('before the show', () => {
      beforeEach(() => {
        store.dispatch(loadSets({ addSeconds: 2 }));
        store.dispatch(tick());
      });

      afterEach(() => {
        fixtureCleanup();
        store.dispatch(resetStoreForTesting());
      });

      it('does not play audio until the show starts', async () => {
        const el = await fixture(template);
        await nextFrame();
        await executeServerCommand('click', 'festival-audio'); // calls el.init()
        const audio = el._activeAudio;

        await aTimeout(400);
        expectAudioIsNotPlaying(audio, '2 seconds before the show');
        await aTimeout(600);

        store.dispatch(tick());
        await aTimeout(400);
        expectAudioIsNotPlaying(audio, '1 second before the show');
        await aTimeout(600);

        store.dispatch(tick());
        await aTimeout(400);
        expectAudioIsPlaying(audio, 'during the show');
        expectNumbersAreAlmostEqual(audio.currentTime, 0.4);
      }).timeout(3000);

      it('fires loadedmetadata event with set and duration', async () => {
        const el = await fixture(template);
        await nextFrame();

        executeServerCommand('click', 'festival-audio'); // calls el.init()
        const { detail } = await oneEvent(el, 'loadedmetadata');
        expect(detail.set).to.have.property('artist', 'Artist 1');
        expectNumbersAreAlmostEqual(detail.duration, AUDIO_FILE_LENGTH);
      });

      it('updates src immediately if set info is changed', async () => {
        const el = await fixture(template);
        await nextFrame();

        executeServerCommand('click', 'festival-audio'); // calls el.init()
        await aTimeout(100);

        store.dispatch(loadSets({ alternate: true }));
        store.dispatch(tick());
        await aTimeout(100);

        const audio = el._activeAudio;
        expect(audio.src).to.satisfy((src) => src.endsWith('?3'));
      });
    });

    describe('during the show', () => {
      afterEach(() => {
        fixtureCleanup();
        store.dispatch(resetStoreForTesting());
      });

      it('delays audio for 2 seconds if initialized during the show', async () => {
        store.dispatch(loadSets({ addSeconds: -5 }));
        store.dispatch(tick());

        const el = await fixture(template);
        await nextFrame();
        await executeServerCommand('click', 'festival-audio'); // calls el.init()
        const audio = el._activeAudio;

        await aTimeout(400);
        expectAudioIsNotPlaying(audio, 'beginning of delay');
        await aTimeout(600);

        store.dispatch(tick());
        await aTimeout(400);
        expectAudioIsNotPlaying(audio, '1 second into delay');
        await aTimeout(600);

        store.dispatch(tick());
        await aTimeout(400);
        expectAudioIsPlaying(audio, 'after delay');
        expectNumbersAreAlmostEqual(audio.currentTime, 7.3);
      }).timeout(3000);

      it('preloads the next set 60 seconds before the end of the first set', async () => {
        store.dispatch(loadSets({ addSeconds: -AUDIO_FILE_LENGTH + 62 }));
        store.dispatch(tick());

        const el = await fixture(template);
        await nextFrame();
        await executeServerCommand('click', 'festival-audio'); // calls el.init()
        const nextAudio = el._inactiveAudio;

        await aTimeout(400);
        expect(
          nextAudio,
          '62 seconds before the end of the first set'
        ).to.not.have.attribute('src');
        await aTimeout(600);

        store.dispatch(tick());
        await aTimeout(400);
        expect(
          nextAudio,
          '61 seconds before the end of the first set'
        ).to.not.have.attribute('src');
        await aTimeout(600);

        store.dispatch(tick());
        await aTimeout(400);
        expect(
          nextAudio,
          '60 seconds before the end of the first set'
        ).to.have.attribute('src');
        expect(nextAudio.src).to.satisfy((src) => src.endsWith('?2'));
      }).timeout(3000);

      it('does not update src if set info is changed', async () => {
        store.dispatch(loadSets({ addSeconds: -AUDIO_FILE_LENGTH + 2 }));
        store.dispatch(tick());

        const el = await fixture(template);
        const audio = el._activeAudio;
        await nextFrame();

        executeServerCommand('click', 'festival-audio'); // calls el.init()
        await aTimeout(100);

        store.dispatch(loadSets({ alternate: true }));
        store.dispatch(tick());

        await aTimeout(400);
        expect(
          audio.src,
          '2 seconds before the end of the first set'
        ).to.satisfy((src) => src.replace(/#t=.*/u, '').endsWith('?1'));
        await aTimeout(600);

        store.dispatch(tick());
        await aTimeout(400);
        expect(
          audio.src,
          '1 second before the end of the first set'
        ).to.satisfy((src) => src.replace(/#t=.*/u, '').endsWith('?1'));
      }).timeout(3000);
    });
  };

  describe('with AudioContext', () => {
    const template = '<festival-audio showinitbutton></festival-audio>';

    commonTests(template);

    describe('init with AudioContext', () => {
      beforeEach(() => {
        store.dispatch(loadSets());
        store.dispatch(tick());
      });

      afterEach(() => {
        fixtureCleanup();
        store.dispatch(resetStoreForTesting());
      });

      it('creates and resumes an audio context', async () => {
        const el = await fixture(template);
        await nextFrame();
        await executeServerCommand('click', 'festival-audio'); // calls el.init()
        await aTimeout(100);

        expect(el).to.have.property('_audioContext');
        expect(el._audioContext.state).to.equal('running');
      });

      it('fires visualizer-data-available with function', async () => {
        const el = await fixture(template);
        await nextFrame();
        executeServerCommand('click', 'festival-audio'); // calls el.init()

        const { detail } = await oneEvent(el, 'visualizer-data-available');
        expect(hashCode(detail.getAudioVisualizerData())).to.equal(0);
      });
    });
  });

  describe('without AudioContext', () => {
    const template =
      '<festival-audio showinitbutton skipaudiocontext></festival-audio>';

    commonTests(template);

    describe('init without AudioContext', () => {
      beforeEach(() => {
        store.dispatch(loadSets());
        store.dispatch(tick());
      });

      afterEach(() => {
        fixtureCleanup();
        store.dispatch(resetStoreForTesting());
      });

      it('does not create an audio context', async () => {
        const el = await fixture(template);
        await nextFrame();
        await executeServerCommand('click', 'festival-audio'); // calls el.init()
        await nextFrame();

        expect(el).to.not.have.property('_audioContext');
      });
    });
  });
});
