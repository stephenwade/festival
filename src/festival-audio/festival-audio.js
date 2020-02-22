import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';
import { ActionMixin } from '../../lib/mixins/action-mixin.js';

export class FestivalAudio extends ActionMixin(PolymerElement) {
  constructor() {
    super();

    this._status = 'WAITING_FOR_AUDIO_CONTEXT';
    this._changeQueue = [];
  }

  static get template() {
    return html`
      <audio id="audio" on-ended="_handleAudioEnded"></audio>
    `;
  }

  static get properties() {
    return {
      state: Object
    };
  }

  static get observers() {
    return ['_currentSetChanged(state.currentSet)'];
  }

  // This must be called from a click event because of Safari
  setupAudioContext() {
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

    this.audioContext.resume().then(() => {
      this.fireAction('AUDIO_CONTEXT_READY', { audioVisualizerData });
      this._status = 'NOT_STARTED';
      this._queueStatusChange();
    });
  }

  _currentSetChanged(currentSet) {
    if (this._status !== 'WAITING_FOR_AUDIO_CONTEXT' && currentSet) {
      if (
        !this._lastCurrentSet ||
        currentSet.status !== this._lastCurrentSet.status ||
        (currentSet.set &&
          this._lastCurrentSet.set &&
          currentSet.set.audio !== this._lastCurrentSet.set.audio)
      ) {
        this._queueStatusChange();
      }
    }

    this._lastCurrentSet = currentSet;
  }

  _queueStatusChange() {
    const change = {
      status: this.state.currentSet.status,
      src: this.state.currentSet.set.audio,
      currentTime: this.state.currentSet.currentTimeInSet
    };

    switch (this._status) {
      case 'WAITING_FOR_AUDIO_CONTEXT':
        throw new Error(
          'Cannot queue status change while waiting for audio context'
        );

      case 'NOT_STARTED':
      case 'LOADING':
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
      case 'WAITING':
        if (this.$.audio.src !== change.src) this.$.audio.src = change.src;
        this._status = 'LOADING';
        break;

      case 'IN_PROGRESS':
        if (this.$.audio.src !== change.src) this.$.audio.src = change.src;
        if (change.currentTime > 0) {
          this.$.audio.play();
          // not implemented yet
        } else {
          this.$.audio.play();
        }
        this._status = 'PLAYING';
        break;

      case 'ENDED':
        break;

      default:
        throw new Error('Unknown status');
    }

    if (this._status !== 'PLAYING') {
      const nextChange = this._changeQueue.shift();
      if (nextChange) this._performStatusChange(nextChange);
    }
  }

  _handleAudioEnded() {
    this._status = 'ENDED';

    const nextChange = this._changeQueue.shift();
    if (nextChange) this._performStatusChange(nextChange);
  }
}

window.customElements.define('festival-audio', FestivalAudio);
