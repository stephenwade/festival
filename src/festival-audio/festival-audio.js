import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';
import { AudioContext } from 'standardized-audio-context';

export class FestivalAudio extends PolymerElement {
  constructor() {
    super();

    this._changeQueue = [];
  }

  static get template() {
    return html`
      <audio id="audio" on-ended="_handleAudioEnded"></audio>
    `;
  }

  static get properties() {
    return {
      targetShowStatus: String,
      targetAudioStatus: {
        type: Object,
        observer: '_targetAudioStatusChanged'
      },
      audioContextReady: {
        type: Boolean,
        notify: true
      },
      audioVisualizerData: {
        type: Object,
        notify: true
      },
      audioStatus: {
        type: String,
        notify: true
      }
    };
  }

  connectedCallback() {
    super.connectedCallback();

    this.audioStatus = 'WAITING_FOR_AUDIO_CONTEXT';
    this.audioContextReady = false;
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

    this.audioStatus = 'WAITING_UNTIL_START';
    this._targetAudioStatusChanged(this.targetAudioStatus);
  }

  _targetAudioStatusChanged(targetAudioStatus) {
    if (this.audioStatus === 'WAITING_FOR_AUDIO_CONTEXT') return;
    if (!targetAudioStatus) return;

    let change;

    const firstRun = !this._lastTargetAudioStatus;
    if (firstRun) {
      const set = targetAudioStatus.set;
      change = {
        status: targetAudioStatus.status,
        src: set ? set.audio : undefined,
        currentTime: targetAudioStatus.currentTime
      };
    } else {
      const statusChanged =
        targetAudioStatus.status !== this._lastTargetAudioStatus.status;
      const set = targetAudioStatus.set;
      const lastSet = this._lastTargetAudioStatus.set;
      const audioChanged = set && (!lastSet || set.audio !== lastSet.audio);
      const loading = this.audioStatus === 'DELAYING_FOR_INITIAL_SYNC';
      if (statusChanged || audioChanged || loading) {
        change = {
          status: targetAudioStatus.status,
          src: audioChanged ? set.audio : undefined,
          currentTime: targetAudioStatus.currentTime
        };
      }
    }

    if (change) this._queueStatusChange(change);

    this._lastTargetAudioStatus = targetAudioStatus;
  }

  _queueStatusChange(change) {
    switch (this.audioStatus) {
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
    if (change.status) {
      switch (change.status) {
        case 'WAITING_UNTIL_START':
          if (change.src) this.$.audio.src = change.src;
          this.audioStatus = 'WAITING_UNTIL_START';
          break;

        case 'PLAYING':
          if (change.src) this.$.audio.src = change.src;
          if (this.audioStatus === 'DELAYING_FOR_INITIAL_SYNC') {
            if (change.currentTime >= this._audioStartTime) {
              this.$.audio.play();
              this.audioStatus = 'PLAYING';
            }
          } else if (change.currentTime > 0) {
            this.audioStatus = 'DELAYING_FOR_INITIAL_SYNC';
            // delay 2 seconds for audio to load
            this._audioStartTime = change.currentTime + 2;
            this.$.audio.src += `#t=${this._audioStartTime}`;
          } else {
            this.$.audio.play();
            this.audioStatus = 'PLAYING';
          }
          break;

        default:
          throw new Error('Unknown status');
      }
    }

    if (this.audioStatus !== 'PLAYING') {
      const nextChange = this._changeQueue.shift();
      if (nextChange) this._performStatusChange(nextChange);
    }
  }

  _handleAudioEnded() {
    this.audioStatus = 'ENDED';

    const nextChange = this._changeQueue.shift();
    if (nextChange) this._performStatusChange(nextChange);
  }
}

window.customElements.define('festival-audio', FestivalAudio);
