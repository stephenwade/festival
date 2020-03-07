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
        value: false
      },
      audioVisualizerData: {
        type: Object,
        notify: true
      },
      audioStatus: {
        type: Object,
        notify: true,
        value: () => ({ status: 'WAITING_FOR_AUDIO_CONTEXT' })
      }
    };
  }

  static get observers() {
    return ['_targetAudioStatusChanged(targetAudioStatus.*)'];
  }

  connectedCallback() {
    super.connectedCallback();

    this._listenForInteraction();
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    if (this._unlistenForInteraction) this._unlistenForInteraction();
  }

  // inspired by https://www.mattmontag.com/web/unlock-web-audio-in-safari-for-ios-and-macos
  _listenForInteraction() {
    if (!this.audioContext) this._setupAudioContext();
    if (this.audioContext.state !== 'suspended') return;

    const events = ['touchstart', 'touchend', 'mousedown', 'keydown'];
    const unlock = () => {
      if (this.targetShowStatus !== 'ENDED') {
        this.$.audio.src = undefined;
        this.$.audio.play().catch(() => {
          // ignore errors
        });
        this.audioContext.resume().then(() => {
          this._handleAudioContextResumed();
          this._unlistenForInteraction();
        });
      }
    };
    this._unlistenForInteraction = () => {
      events.forEach(e => document.body.removeEventListener(e, unlock));
    };
    events.forEach(e => {
      document.body.addEventListener(e, unlock);
    });
  }

  _setupAudioContext() {
    this.audioContext = new AudioContext();

    const track = this.audioContext.createMediaElementSource(this.$.audio);

    const analyserNode = this.audioContext.createAnalyser();
    analyserNode.fftSize = 1024;
    analyserNode.minDecibels = -85;
    analyserNode.smoothingTimeConstant = 0.7;

    this._audioVisualizerData = new Uint8Array(analyserNode.frequencyBinCount);

    // const gainNode = this.audioContext.createGain();
    // gainNode.gain.value = 0.2;

    track
      .connect(analyserNode)
      // .connect(gainNode)
      .connect(this.audioContext.destination);
  }

  _handleAudioContextResumed() {
    this.audioContextReady = true;
    this.audioVisualizerData = this._audioVisualizerData;

    this.set('audioStatus.status', 'WAITING_UNTIL_START');
    this._targetAudioStatusChanged();
  }

  _targetAudioStatusChanged() {
    if (this.audioStatus.status === 'WAITING_FOR_AUDIO_CONTEXT') return;

    const targetAudioStatus = this.targetAudioStatus;

    const thisStatus = { ...targetAudioStatus };

    const firstRun = !this._lastTargetAudioStatus;
    if (firstRun) {
      this._queueStatusChange(thisStatus);
    } else {
      const statusChanged =
        targetAudioStatus.status !== this._lastTargetAudioStatus.status;
      const setChanged =
        targetAudioStatus.set !== this._lastTargetAudioStatus.set;

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
        throw new Error(
          'Cannot queue status change while waiting for audio context'
        );

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
          secondsUntilSet: change.secondsUntilSet
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
            delayingUntil
          };
          this.$.audio.src += `#t=${delayingUntil}`;
        } else {
          this.$.audio.play();
          this.audioStatus = {
            set: change.set,
            status: 'PLAYING',
            currentTime: 0
          };
        }
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
            currentTime: this.audioStatus.delayingUntil
          };
        }
        break;

      // no default
    }
  }

  _handleAudioEnded() {
    this.set('audioStatus.status', 'ENDED');

    const nextChange = this._changeQueue.shift();
    if (nextChange) this._performStatusChange(nextChange);
  }

  _handleAudioTimeUpdate() {
    if (this.audioStatus.status === 'PLAYING') {
      const currentTime = this.$.audio.currentTime;
      this.set('audioStatus.currentTime', currentTime);
    }
  }
}

window.customElements.define('festival-audio', FestivalAudio);
