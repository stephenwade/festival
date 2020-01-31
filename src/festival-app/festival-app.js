import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';
import { afterNextRender } from '@polymer/polymer/lib/utils/render-status.js';
import '@polymer/polymer/lib/elements/dom-if.js';
import '@polymer/paper-spinner/paper-spinner-lite.js';
import '../festival-waiting/festival-waiting.js';
import '../music-player/music-player.js';

export class FestivalApp extends PolymerElement {
  constructor() {
    super();

    afterNextRender(this, this._fetchSets);
  }

  static get template() {
    return html`
      <style>
        :host {
          position: absolute;
          width: 100%;
          height: 100%;
          background-color: #121212;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Roboto', sans-serif;
          font-weight: 300;
          color: rgba(255, 255, 255, 0.87);
        }

        paper-spinner-lite {
          width: 100px;
          height: 100px;
          --paper-spinner-color: #ffb74d; /* material orange 300 */
          --paper-spinner-stroke-width: 8px;
        }

        festival-waiting {
          transition: opacity 2s ease-in;
        }

        festival-waiting.ending {
          opacity: 0;
        }
      </style>
      <template is="dom-if" if="[[loading]]" restamp>
        <paper-spinner-lite active></paper-spinner-lite>
      </template>
      <template is="dom-if" if="[[waiting]]" restamp>
        <festival-waiting
          id="waiting"
          sets="[[sets]]"
          on-join="_handleJoined"
          on-countdown-changed="_handleCountdownChanged"
        ></festival-waiting>
      </template>
      <music-player id="musicPlayer" src="[[_audioSrc]]"></music-player>
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
      },
      _audioSrc: {
        type: String,
        computed: '_computeAudioSrc(sets)'
      }
    };
  }

  _computeAudioSrc(sets) {
    return sets[0].audio;
  }

  _handleJoined() {
    this.$.musicPlayer.resumeAudioContext();
  }

  _handleCountdownChanged(e) {
    const { seconds } = e.detail;

    if (seconds === 2) this.$.waiting.classList.add('ending');

    if (seconds <= 2) this.$.musicPlayer.queue();

    if (seconds <= 0) {
      this.waiting = false;
      this.$.musicPlayer.play();
    }
  }

  _handleCountdownEnding() {
    this.$.waiting.classList.add('ending');
    this.$.musicPlayer.queue();
  }

  _handleCountdownFinished() {
    this.waiting = false;
    this.$.musicPlayer.play();
  }

  _fetchSets() {
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
