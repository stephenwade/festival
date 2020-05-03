import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';
import { AudioContext } from 'standardized-audio-context';

export class FestivalAudio extends PolymerElement {
  constructor() {
    super();

    this._changeQueue = [];
  }

  static get template() {
    return html`
      <audio
        id="audio"
        on-ended="_handleAudioEnded"
        on-timeupdate="_handleAudioTimeUpdate"
        on-error="_handleAudioError"
        on-waiting="_handleAudioWaiting"
        on-playing="_handleAudioPlaying"
        on-stalled="_handleAudioStalled"
        on-loadedmetadata="_handleAudioLoadedMetadata"
      ></audio>
    `;
  }

  static get properties() {
    return {
      targetShowStatus: String,
      targetAudioStatus: Object,
      audioContextReady: {
        type: Boolean,
        notify: true,
        value: false,
      },
      getAudioVisualizerData: {
        type: Function,
        notify: true,
      },
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
    };
  }

  static get observers() {
    return ['_targetAudioStatusChanged(targetAudioStatus.*)'];
  }

  initialize() {
    // skip setting up AudioContext on iOS
    const iOS = /iPad|iPhone|iPod/u.test(navigator.userAgent);
    if (!iOS) {
      if (!this.audioContext) {
        try {
          this._setupAudioContext();
        } catch (e) {
          // ignore errors
        }
      }
      if (this.audioContext && this.audioContext.state !== 'suspended') return;
    }

    if (this.targetShowStatus !== 'ENDED') {
      this.$.audio.src = undefined;
      this.$.audio.play().catch(() => {
        // ignore errors
      });
      if (!this.audioContext) {
        this._handleAudioContextResumed();
      } else {
        this.audioContext
          .resume()
          .then(this._handleAudioContextResumed.bind(this));
      }
    }
  }

  _setupAudioContext() {
    this.audioContext = new AudioContext();

    const track = this.audioContext.createMediaElementSource(this.$.audio);

    const analyserNode = this.audioContext.createAnalyser();
    analyserNode.fftSize = 1024;
    analyserNode.minDecibels = -85;
    analyserNode.smoothingTimeConstant = 0.7;

    const audioVisualizerData = new Uint8Array(analyserNode.frequencyBinCount);

    // const gainNode = this.audioContext.createGain();
    // gainNode.gain.value = 0.2;

    track
      .connect(analyserNode)
      // .connect(gainNode)
      .connect(this.audioContext.destination);

    this.getAudioVisualizerData = () => {
      analyserNode.getByteFrequencyData(audioVisualizerData);
      return audioVisualizerData;
    };
  }

  _handleAudioContextResumed() {
    this.audioContextReady = true;

    this.set('audioStatus.status', 'WAITING_UNTIL_START');
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
    switch (change.status) {
      case 'WAITING_UNTIL_START':
        if (change.set !== this.audioStatus.set)
          this.$.audio.src = change.set.audio;
        this.audioStatus = {
          set: change.set,
          status: 'WAITING_UNTIL_START',
          secondsUntilSet: change.secondsUntilSet,
        };
        break;

      case 'PLAYING':
        if (change.set !== this.audioStatus.set)
          this.$.audio.src = change.set.audio;
        if (change.currentTime > 0) {
          // delay 2 seconds for audio to load
          const delayingUntil = change.currentTime + 2;
          this.audioStatus = {
            set: change.set,
            status: 'DELAYING_FOR_INITIAL_SYNC',
            delayingUntil,
          };
          this.$.audio.src += `#t=${delayingUntil}`;
        } else {
          this.$.audio.play().catch(this._handleAudioError.bind(this));
          this.audioStatus = {
            set: change.set,
            status: 'PLAYING',
            currentTime: 0,
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
        this.set('audioStatus.secondsUntilSet', change.secondsUntilSet);
        break;

      case 'DELAYING_FOR_INITIAL_SYNC':
        if (change.currentTime >= this.audioStatus.delayingUntil) {
          this.$.audio.play();
          this.audioStatus = {
            set: change.set,
            status: 'PLAYING',
            currentTime: this.audioStatus.delayingUntil,
          };
        }
        break;

      case 'PLAYING':
        this.set('audioStatus.delay', this._getDelay(change));
        break;

      // no default
    }
  }

  _getDelay(change) {
    let delay = change.currentTime - this.$.audio.currentTime;
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

  _handleAudioEnded() {
    delete this.audioStatus.set;
    delete this.audioStatus.delay;
    this.set('audioStatus.status', 'WAITING_UNTIL_START');

    const nextChange = this._changeQueue.shift();
    if (nextChange) this._performStatusChange(nextChange);
  }

  _handleAudioTimeUpdate() {
    if (this.audioStatus.status === 'PLAYING') {
      const currentTime = this.$.audio.currentTime;
      this.set('audioStatus.currentTime', currentTime);
    }
  }

  _handleAudioError() {
    this.dispatchEvent(
      new CustomEvent('error', {
        bubbles: true,
        composed: true,
      })
    );
    this._error = true;
  }

  _handleAudioWaiting() {
    this.audioWaiting = true;

    this._stalledTimeout = setTimeout(
      this._handleAudioStalled.bind(this),
      10 * 1000
    );
  }

  _handleAudioPlaying() {
    this.audioWaiting = false;
    this.audioStalled = false;

    clearTimeout(this._stalledTimeout);
  }

  _handleAudioStalled() {
    this.audioStalled = true;
  }

  _handleAudioLoadedMetadata() {
    this.dispatchEvent(
      new CustomEvent('loadedmetadata', {
        bubbles: true,
        composed: true,
        detail: {
          set: this.audioStatus.set,
          duration: this.$.audio.duration,
        },
      })
    );
  }
}

window.customElements.define('festival-audio', FestivalAudio);
