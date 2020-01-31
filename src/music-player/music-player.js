import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';
import { afterNextRender } from '@polymer/polymer/lib/utils/render-status.js';
import '@polymer/polymer/lib/elements/dom-if.js';
import { AudioContext } from 'standardized-audio-context';

export class MusicPlayer extends PolymerElement {
  constructor() {
    super();

    afterNextRender(this, () => {
      this._audioContext = new AudioContext();

      this._track = this._audioContext.createMediaElementSource(this.$.audio);

      this._analyserNode = this._audioContext.createAnalyser();
      this._analyserNode.fftSize = 1024;
      this._analyserNode.minDecibels = -85;
      this._analyserNode.smoothingTimeConstant = 0.7;
      this._analyzerData = new Uint8Array(this._analyserNode.frequencyBinCount);

      this._gainNode = this._audioContext.createGain();
      // this._gainNode.gain.value = 0.2;

      this._track
        .connect(this._analyserNode)
        .connect(this._gainNode)
        .connect(this._audioContext.destination);
    });
  }

  static get template() {
    return html`
      <style>
        :host {
          font-size: 40px;
        }
      </style>
      <audio id="audio" on-timechange="_handleTimeChange"></audio>
    `;
  }

  static get properties() {
    return {
      src: {
        type: String
      },
      _currentTime: {
        type: Number,
        value: 0
      }
    };
  }

  resumeAudioContext() {
    // Safari will only resume the AudioContext on a click event
    this._audioContext.resume();
  }

  queue() {
    this.$.audio.src = this.src;
  }

  play() {
    this.$.audio.play();
  }

  _handleTimeChange(e) {
    this._currentTime = e.target.currentTime;
  }
}

window.customElements.define('music-player', MusicPlayer);
