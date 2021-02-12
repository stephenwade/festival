import { expect } from '@open-wc/testing';

import {
  audioEnded,
  audioPlaying,
  audioPaused,
  audioStalled,
  audioWaiting,
} from '../../src/actions/audioStatus.js';

describe('audio status action creators', () => {
  describe('audioEnded', () => {
    it('creates an action to reset the audio status', () => {
      const result = audioEnded();
      expect(result.type).to.equal('RESET_AUDIO_STATUS');
    });
  });

  describe('audioPlaying', () => {
    it('creates an action to reset the audio status', () => {
      const result = audioPlaying();
      expect(result.type).to.equal('RESET_AUDIO_STATUS');
    });
  });

  describe('audioPaused', () => {
    it('creates an action to say that the audio is paused', () => {
      const result = audioPaused();
      expect(result.type).to.equal('AUDIO_PAUSED');
    });
  });

  describe('audioStalled', () => {
    it('creates an action to say that the audio is stalled', () => {
      const result = audioStalled();
      expect(result.type).to.equal('AUDIO_STALLED');
    });
  });

  describe('audioWaiting', () => {
    it('creates an action to say that the audio is waiting', () => {
      const result = audioWaiting();
      expect(result.type).to.equal('AUDIO_WAITING');
    });
  });
});
