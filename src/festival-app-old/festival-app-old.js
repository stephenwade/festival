import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';
import { afterNextRender } from '@polymer/polymer/lib/utils/render-status.js';
import '@polymer/polymer/lib/elements/dom-if.js';
import '@polymer/paper-spinner/paper-spinner-lite.js';
import moment from 'moment/src/moment.js';
import '../festival-waiting/festival-waiting.js';
import '../music-player/music-player.js';

export class FestivalApp extends PolymerElement {
  constructor() {
    super();

    afterNextRender(this, this._mockFetchSets);
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
      <festival-waiting
        id="waiting"
        hidden$="[[!waiting]]"
        sets="[[sets]]"
        seconds="{{secondsToJoin}}"
        on-join="_handleJoined"
      ></festival-waiting>
      <music-player
        id="musicPlayer"
        src="[[_audioSrc]]"
        hidden$="[[!playing]]"
      ></music-player>
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
      playing: {
        type: Boolean,
        value: false
      },
      sets: {
        type: Object,
        value: undefined
      },
      secondsToJoin: {
        type: Number,
        observer: '_secondsToJoinChanged',
        // initial value is to undefined so that the first update will trigger
        // the observer, even if the first value is 0
        value: undefined
      },
      _audioSrc: {
        type: String,
        computed: '_computeAudioSrc(sets)'
      }
    };
  }

  _secondsToJoinChanged(secondsToJoin) {
    if (secondsToJoin <= 2.5) {
      this.$.waiting.classList.add('ending');
      this.$.musicPlayer.queue();
    }

    if (secondsToJoin <= 0) {
      this.waiting = false;
      this.playing = true;
      this.$.musicPlayer.play(-secondsToJoin);
    }
  }

  _computeAudioSrc(sets) {
    return sets[0].audio;
  }

  _handleJoined() {
    this.$.musicPlayer.resumeAudioContext();
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

  _mockFetchSets() {
    this.sets = [
      {
        audio: '/public/mock/not-enough.mp3',
        title: 'Anavae – Not Enough Instrumental',
        start: moment()
          .add(5, 'seconds')
          .toISOString(),
        length: 224.03
      },
      {
        audio: '/public/mock/modern.mp3',
        title: 'bignic – Modern',
        start: moment()
          .add(229, 'seconds')
          .toISOString(),
        length: 186.44
      },
      {
        audio: '/public/mock/how-i-love.mp3',
        title: 'Mayhem – How I Love',
        start: moment()
          .add(632, 'seconds')
          .toISOString(),
        length: 192.89
      },
      {
        audio: '/public/mock/wonderland.mp3',
        title: 'Griffin McElroy – Wonderland Round Three',
        start: moment()
          .add(855, 'seconds')
          .toISOString(),
        length: 156.92
      }
    ];
    console.log(this.sets); // eslint-disable-line no-console
    this.waiting = true;
    this.loading = false;
  }
}

window.customElements.define('festival-app', FestivalApp);
