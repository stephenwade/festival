import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';
import { afterNextRender } from '@polymer/polymer/lib/utils/render-status.js';
import '@polymer/polymer/lib/elements/dom-if.js';
import '../countdown-timer/countdown-timer.js';
import '../join-button/join-button.js';
import '../music-player/music-player.js';

/**
 * @customElement
 * @polymer
 */
export class FestivalApp extends PolymerElement {
  constructor() {
    super();

    afterNextRender(this, () => {
      fetch('/public/sets.json')
        .then(response => response.json())
        .then(json => {
          this.sets = json;
        });
    });
  }

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
          font-family: 'Roboto', sans-serif;
          font-weight: 100;
        }
      </style>
      <template is="dom-if" if="[[!joined]]">
        <join-button on-click="joinClicked"></join-button>
      </template>
      <template is="dom-if" if="[[waiting]]">
        <countdown-timer on-click="timerClicked" sets="[[sets]]"></countdown-timer>
      </template>
      <template is="dom-if" if="[[playing]]">
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
      },
      sets: {
        type: Object,
        value: undefined
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
