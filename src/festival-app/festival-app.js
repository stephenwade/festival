import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';
import { afterNextRender } from '@polymer/polymer/lib/utils/render-status.js';
import '@polymer/polymer/lib/elements/dom-if.js';
import '../countdown-timer/countdown-timer.js';
import '../join-button/join-button.js';
import '@polymer/paper-spinner/paper-spinner-lite.js';
import '../music-player/music-player.js';

/**
 * @customElement
 * @polymer
 */
export class FestivalApp extends PolymerElement {
  constructor() {
    super();

    afterNextRender(this, this.fetchSets);
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
          font-weight: 300;
          color: #fffa;
        }
        paper-spinner-lite {
          width: 100px;
          height: 100px;
          --paper-spinner-color: #b5b5bc;
          --paper-spinner-stroke-width: 8px;
        }
      </style>
      <template is="dom-if" if="[[loading]]" restamp>
        <paper-spinner-lite active></paper-spinner-lite>
      </template>
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
      loading: {
        type: Boolean,
        value: true
      },
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

  fetchSets() {
    fetch('/public/sets.json')
      .then(response => response.json())
      .then(json => {
        this.sets = json;
        this.loading = false;
      });
  }
}

window.customElements.define('festival-app', FestivalApp);
