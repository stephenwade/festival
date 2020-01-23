import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';
import '@polymer/polymer/lib/elements/dom-if.js';
import '../countdown-timer/countdown-timer.js';
import '../join-button/join-button.js';
import '../music-player/music-player.js';

/**
 * @customElement
 * @polymer
 */
export class FestivalApp extends PolymerElement {
  static get template() {
    return html`
      <style>
        :host {
          position: absolute;
          width: 100%;
          height: 100%;
          background-color: #223;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      </style>
      <template is="dom-if" if="{{!joined}}">
        <join-button on-click="joinClicked"></join-button>
      </template>
      <template is="dom-if" if="{{waiting}}">
        <countdown-timer on-click="timerClicked"></countdown-timer>
      </template>
      <template is="dom-if" if="{{playing}}">
        <music-player></music-player>
      </template>
    `;
  }

  static get properties() {
    return {
      joined: {
        type: Boolean,
        value: false
      },
      playing: {
        type: Boolean,
        value: false
      },
      waiting: {
        type: Boolean,
        computed: 'computeWaiting(joined, playing)'
      }
    };
  }

  computeWaiting(joined, playing) {
    return joined && !playing;
  }

  joinClicked() {
    this.joined = true;
  }

  timerClicked() {
    this.playing = true;
  }
}

window.customElements.define('festival-app', FestivalApp);
