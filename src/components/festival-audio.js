import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';
import { connect } from 'pwa-helpers/connect-mixin.js';
import { AudioContext } from 'standardized-audio-context';

import { store } from '../store.js';

export class FestivalAudio extends connect(store)(PolymerElement) {
  constructor() {
    super();

    this._changeQueue = [];

    this._audioEvents = {
      ended: this._handleAudioEnded.bind(this),
      error: this._handleAudioError.bind(this),
      loadedmetadata: this._handleAudioLoadedMetadata.bind(this),
      pause: this._handleAudioPause.bind(this),
      playing: this._handleAudioPlaying.bind(this),
      stalled: this._handleAudioStalled.bind(this),
      timeupdate: this._handleAudioTimeUpdate.bind(this),
      waiting: this._handleAudioWaiting.bind(this),
    };
  }

  static get template() {
    return html`
      <audio id="audio1" crossorigin="anonymous"></audio>
      <audio id="audio2" crossorigin="anonymous"></audio>
    `;
  }

  static get properties() {
    return {
      targetAudioStatus: Object,
      audioStatus: {
        type: Object,
        notify: true,
        value: () => ({ status: 'WAITING_FOR_AUDIO_CONTEXT' }),
      },
      audioWaiting: {
        type: Boolean,
        notify: true,
        value: false,
      },
      audioStalled: {
        type: Boolean,
        notify: true,
        value: false,
      },
      audioPaused: {
        type: Boolean,
        notify: true,
        value: false,
      },
    };
  }

  static get observers() {
    return ['_targetAudioStatusChanged(targetAudioStatus.*)'];
  }

  connectedCallback() {
    super.connectedCallback();

    this._audioElements = [this.$.audio1, this.$.audio2];

    this._audioElements.forEach((audio) => {
      Object.keys(this._audioEvents).forEach((event) => {
        const handler = this._audioEvents[event];
        audio.addEventListener(event, handler);
      });
    });

    this._activeAudio = this._audioElements[0];
    this._inactiveAudio = this._audioElements[1];
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    this._audioElements.forEach((audio) => {
      Object.keys(this._audioEvents).forEach((event) => {
        const handler = this._audioEvents[event];
        audio.removeEventListener(event, handler);
      });
    });
  }

  stateChanged(state) {
    this.targetAudioStatus = state.targetAudioStatus;
  }

  initialize() {
    if (this.targetAudioStatus.status === 'ENDED') return;

    // skip setting up AudioContext on iOS
    const iOS = /iPad|iPhone|iPod/u.test(navigator.userAgent);
    if (!iOS) {
      try {
        this._setupAudioContext();
      } catch (e) {
        // ignore errors
      }
    }

    this._audioElements.forEach((audio) => {
      // Safari: activate the audio element by trying to play
      audio.play().catch(() => {
        // ignore errors
      });
      // Firefox: if you don't pause after trying to play, it will start to play
      // as soon as src is set
      audio.pause();
    });

    if (!this._audioContext) {
      this._handleAudioContextResumed();
    } else {
      this._audioContext
        .resume()
        .then(this._handleAudioContextResumed.bind(this));
    }
  }

  _setupAudioContext() {
    this._audioContext = new AudioContext();

    const tracks = this._audioElements.map((audio) =>
      this._audioContext.createMediaElementSource(audio)
    );

    const analyserNode = this._audioContext.createAnalyser();
    analyserNode.fftSize = 1024;
    analyserNode.minDecibels = -85;
    analyserNode.smoothingTimeConstant = 0.7;

    const audioVisualizerData = new Uint8Array(analyserNode.frequencyBinCount);

    // const gainNode = this._audioContext.createGain();
    // gainNode.gain.value = 0.2;

    tracks.forEach((track) => {
      track
        .connect(analyserNode)
        // .connect(gainNode)
        .connect(this._audioContext.destination);
    });

    const getAudioVisualizerData = () => {
      analyserNode.getByteFrequencyData(audioVisualizerData);
      return audioVisualizerData;
    };

    this.dispatchEvent(
      new CustomEvent('visualizer-data-available', {
        bubbles: true,
        composed: true,
        detail: { getAudioVisualizerData },
      })
    );
  }

  _handleAudioContextResumed() {
    this.audioStatus = {
      ...this.audioStatus,
      status: 'WAITING_UNTIL_START',
    };
    this._targetAudioStatusChanged();
  }

  _targetAudioStatusChanged() {
    if (this._error) return;

    const thisStatus = { ...this.targetAudioStatus };

    const ended = thisStatus.status === 'ENDED';
    const waitingForAudioContext =
      this.audioStatus.status === 'WAITING_FOR_AUDIO_CONTEXT';

    if (waitingForAudioContext && !ended) return;

    const firstRun = !this._lastTargetAudioStatus;
    if (firstRun) {
      this._queueStatusChange(thisStatus);
    } else {
      const statusChanged =
        thisStatus.status !== this._lastTargetAudioStatus.status;
      const setChanged = thisStatus.set !== this._lastTargetAudioStatus.set;

      if (statusChanged || setChanged) {
        this._queueStatusChange(thisStatus);
      } else {
        this._updateTime(thisStatus);
      }
    }

    this._lastTargetAudioStatus = thisStatus;
  }

  _queueStatusChange(change) {
    switch (this.audioStatus.status) {
      case 'WAITING_FOR_AUDIO_CONTEXT':
      case 'WAITING_UNTIL_START':
      case 'DELAYING_FOR_INITIAL_SYNC':
      case 'ENDED':
        this._performStatusChange(change);
        break;

      case 'PLAYING':
        this._changeQueue.push(change);
        break;

      default:
        throw new Error('Unknown status');
    }
  }

  _performStatusChange(change) {
    const setChanged = change.set !== this.audioStatus.set;
    const nextSrcAlreadySet = Boolean(this._activeAudio.src);
    const shouldChangeSrc = setChanged && !nextSrcAlreadySet;

    switch (change.status) {
      case 'WAITING_UNTIL_START':
        if (shouldChangeSrc) this._activeAudio.src = change.set.audio;

        this.audioStatus = {
          set: change.set,
          status: 'WAITING_UNTIL_START',
          secondsUntilSet: change.secondsUntilSet,
          nextSet: change.nextSet,
        };
        break;

      case 'PLAYING':
        if (shouldChangeSrc) this._activeAudio.src = change.set.audio;

        if (change.currentTime > 0) {
          // delay 2 seconds for audio to load
          const delayingUntil = change.currentTime + 2;
          this.audioStatus = {
            set: change.set,
            status: 'DELAYING_FOR_INITIAL_SYNC',
            delayingUntil,
            nextSet: change.nextSet,
          };
          this._activeAudio.src += `#t=${delayingUntil}`;
        } else {
          this._activeAudio.play().catch(this._handleAudioError.bind(this));
          this.audioStatus = {
            set: change.set,
            status: 'PLAYING',
            currentTime: 0,
            nextSet: change.nextSet,
          };
        }
        break;

      case 'ENDED':
        this.audioStatus = {
          status: 'ENDED',
        };
        break;

      default:
        throw new Error('Unknown status');
    }

    if (this.audioStatus.status !== 'PLAYING') {
      const nextChange = this._changeQueue.shift();
      if (nextChange) this._performStatusChange(nextChange);
    }
  }

  _updateTime(change) {
    switch (this.audioStatus.status) {
      case 'WAITING_UNTIL_START':
        this.audioStatus = {
          ...this.audioStatus,
          secondsUntilSet: change.secondsUntilSet,
        };
        break;

      case 'DELAYING_FOR_INITIAL_SYNC':
        if (change.currentTime >= this.audioStatus.delayingUntil) {
          this._activeAudio.play();
          this.audioStatus = {
            set: change.set,
            status: 'PLAYING',
            currentTime: this.audioStatus.delayingUntil,
          };
        }
        break;

      case 'PLAYING':
        this.audioStatus = {
          ...this.audioStatus,
          delay: this._getDelay(change),
        };
        break;

      // no default
    }
  }

  _getDelay(change) {
    let delay = change.currentTime - this._activeAudio.currentTime;
    if (change.set !== this.audioStatus.set) {
      const setDifference = change.set.startMoment.diff(
        this.audioStatus.set.startMoment,
        'seconds'
      );
      delay += setDifference;
    }

    if (delay < 0) return 0;
    return delay;
  }

  _clearAndSwitchActiveAudio() {
    this._activeAudio.removeAttribute('src');

    // prettier-ignore
    // swap _activeAudio and _inactiveAudio
    [this._activeAudio, this._inactiveAudio] =
      [this._inactiveAudio, this._activeAudio];
  }

  _handleAudioEnded(e) {
    if (e.target !== this._activeAudio) return;

    this._clearAndSwitchActiveAudio();

    // eslint-disable-next-line no-unused-vars
    const { set, delay, ...noSetOrDelay } = this.audioStatus;
    this.audioStatus = {
      ...noSetOrDelay,
      status: 'WAITING_UNTIL_START',
    };

    const nextChange = this._changeQueue.shift();
    if (nextChange) this._performStatusChange(nextChange);

    this.audioStalled = false;
    clearTimeout(this._stalledTimeout);

    this.audioPaused = false;
  }

  _handleAudioTimeUpdate(e) {
    if (e.target !== this._activeAudio) return;

    if (this.audioStatus.status === 'PLAYING') {
      const currentTime = this._activeAudio.currentTime;
      this.audioStatus = {
        ...this.audioStatus,
        currentTime,
      };

      const nextSrcAlreadySet = Boolean(this._inactiveAudio.src);
      const nextSetAvailable = Boolean(this.audioStatus.nextSet);
      const lessThanOneMinuteLeft =
        this.audioStatus.set.length - this.audioStatus.currentTime <= 60;
      const shouldPreloadNextSet =
        !nextSrcAlreadySet && nextSetAvailable && lessThanOneMinuteLeft;
      if (shouldPreloadNextSet) {
        this._inactiveAudio.src = this.audioStatus.nextSet.audio;
      }
    }
  }

  _handleAudioError() {
    this.dispatchEvent(
      new CustomEvent('error', { bubbles: true, composed: true })
    );
    this._error = true;
  }

  _handleAudioWaiting(e) {
    if (e.target !== this._activeAudio) return;

    this.audioWaiting = true;

    this._stalledTimeout = setTimeout(
      this._handleAudioStalled.bind(this),
      10 * 1000
    );
  }

  _handleAudioPlaying(e) {
    if (e.target !== this._activeAudio) return;

    this.audioWaiting = false;

    this.audioStalled = false;
    clearTimeout(this._stalledTimeout);

    this.audioPaused = false;
  }

  _handleAudioPause(e) {
    if (e.target !== this._activeAudio) return;

    this.audioPaused = true;
  }

  _handleAudioStalled(e) {
    if (
      e && // this function can be called without an event object
      e.target !== this._activeAudio
    )
      return;

    // Safari: only listen to stalled event if audio is waiting
    if (!this.audioWaiting) return;

    this.audioStalled = true;
  }

  _handleAudioLoadedMetadata(e) {
    const set =
      e.target === this._activeAudio
        ? this.audioStatus.set
        : this.audioStatus.nextSet;

    this.dispatchEvent(
      new CustomEvent('loadedmetadata', {
        bubbles: true,
        composed: true,
        detail: {
          set,
          duration: e.target.duration,
        },
      })
    );
  }
}

window.customElements.define('festival-audio', FestivalAudio);
