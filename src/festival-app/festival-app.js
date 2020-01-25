import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';
import { afterNextRender } from '@polymer/polymer/lib/utils/render-status.js';
import '@polymer/polymer/lib/elements/dom-if.js';
import '@polymer/paper-spinner/paper-spinner-lite.js';
import '../festival-waiting/festival-waiting.js';
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
      <template is="dom-if" if="[[waiting]]" restamp>
        <festival-waiting sets="[[sets]]" on-click="waitingClicked"></festival-waiting>
      </template>
      <music-player></music-player>
    `;
  }

  static get properties() {
    return {
      loading: {
        type: Boolean,
        value: true
      },
      waiting: {
        type: Boolean,
        value: false
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

  waitingClicked() {
    this.waiting = false;
    this.shadowRoot.querySelector('music-player').play();
  }

  fetchSets() {
    fetch('/public/sets.json')
      .then(response => response.json())
      .then(json => {
        this.sets = json;
        this.waiting = true;
        this.loading = false;
      });
  }
}

window.customElements.define('festival-app', FestivalApp);
