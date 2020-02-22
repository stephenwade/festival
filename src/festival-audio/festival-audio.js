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
      this._currentSetChanged(this.state.currentSet);
    });
  }

  _currentSetChanged(currentSet) {
    if (this._status === 'WAITING_FOR_AUDIO_CONTEXT') return;
    if (!currentSet) return;

    let change;

    const firstRun = !this._lastCurrentSet;
    if (firstRun) {
      const set = this.state.currentSet.set;
      change = {
        status: this.state.currentSet.status,
        src: set ? set.audio : undefined,
        currentTime: this.state.currentSet.currentTimeInSet
      };
    } else {
      const statusChanged = currentSet.status !== this._lastCurrentSet.status;
      const set = this.state.currentSet.set;
      const lastSet = this._lastCurrentSet.set;
      const audioChanged = set && (!lastSet || set.audio !== lastSet.audio);
      const loading = this._status === 'LOADING';
      if (statusChanged || audioChanged || loading) {
        change = {
          status: this.state.currentSet.status,
          src: audioChanged ? set.audio : undefined,
          currentTime: this.state.currentSet.currentTimeInSet
        };
      }
    }

    if (change) this._queueStatusChange(change);

    this._lastCurrentSet = currentSet;
  }

  _queueStatusChange(change) {
    switch (this._status) {
      case 'WAITING_FOR_AUDIO_CONTEXT':
        throw new Error(
          'Cannot queue status change while waiting for audio context'
        );

      case 'NOT_STARTED':
      case 'PRELOADING':
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
        if (change.src) this.$.audio.src = change.src;
        this._status = 'PRELOADING';
        break;

      case 'IN_PROGRESS':
        if (change.src) this.$.audio.src = change.src;
        if (this._status === 'LOADING') {
          if (change.currentTime >= this._audioStartTime) {
            this.$.audio.play();
            this._status = 'PLAYING';
          }
        } else if (change.currentTime > 0) {
          this._status = 'LOADING';
          // delay 2 seconds for audio to load
          this._audioStartTime = change.currentTime + 2;
          this.$.audio.src += `#t=${this._audioStartTime}`;
        } else {
          this.$.audio.play();
          this._status = 'PLAYING';
        }
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
