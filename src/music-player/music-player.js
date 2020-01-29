import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';
import '@polymer/polymer/lib/elements/dom-if.js';
import { AudioContext } from 'standardized-audio-context';

export class MusicPlayer extends PolymerElement {
  constructor() {
    super();

    this.audioContext = new AudioContext();
  }

  static get template() {
    return html`
      <style>
        :host {
          font-size: 40px;
        }
      </style>
      <template is="dom-if" id="if-audiocontext">
        Resumed AudioContext
      </template>
      <template is="dom-if" id="if-play">
        Playing music
      </template>
    `;
  }

  prepareAudioContext() {
    // Safari will only resume the AudioContext on a click event
    this.audioContext.resume();

    this.shadowRoot.getElementById('if-audiocontext').if = true;
    setTimeout(() => {
      this.shadowRoot.getElementById('if-audiocontext').if = false;
    }, 1000);
  }

  play() {
    this.shadowRoot.getElementById('if-play').if = true;
  }
}

window.customElements.define('music-player', MusicPlayer);
