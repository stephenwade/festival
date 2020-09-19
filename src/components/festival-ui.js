import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';
import { connect } from 'pwa-helpers/connect-mixin.js';
import '@polymer/polymer/lib/elements/dom-if.js';

import '../../lib/toast-sk/toast-sk.js';
import { store } from '../store.js';
import './festival-ui-ended.js';
import './festival-ui-intro.js';
import './festival-ui-playing.js';

export class FestivalUi extends connect(store)(PolymerElement) {
  static get template() {
    return html`
      <style>
        :host {
          box-sizing: border-box;
          user-select: none;
        }
        *,
        *:before,
        *:after {
          box-sizing: inherit;
        }

        [hidden] {
          display: none !important;
        }

        :host {
          position: absolute;
          width: 100%;
          height: 100%;
          color: white;
          font-family: 'HelveticaNeue-Light', 'Helvetica Neue Light',
            'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif;
          background: var(--gradient-background);
          background-size: 100% auto;
        }

        button {
          font-family: inherit;
          font-size: inherit;
          line-height: inherit;
          text-transform: uppercase;
          border: none;
          margin: 0;
          background-color: inherit;
          color: inherit;
          cursor: pointer;
          padding: 0.7em 0.7em;
          margin: 0 0.3em;
          min-width: 5em;
        }
        button::-moz-focus-inner {
          border-style: none;
          padding: 0;
        }
        button:-moz-focusring {
          outline: 1px dotted ButtonText;
        }

        toast-sk {
          background-color: #323232;
          color: #f1f1f1;
          border-radius: 3px;
          padding: 0.7em 1.5em;
        }

        toast-sk button:first-of-type {
          margin-right: -0.5em;
        }

        toast-sk button + button {
          margin-left: -0.5em;
        }

        toast-sk button:last-child {
          margin-right: -1em;
        }
      </style>

      <template is="dom-if" if="[[_waitingForAudioContext]]">
        <festival-ui-intro></festival-ui-intro>
      </template>
      <template is="dom-if" if="[[_showPlaying]]">
        <festival-ui-playing
          set="[[showStatus.set]]"
          waiting-until-start="[[_waitingUntilStart]]"
          seconds-until-set="[[showStatus.secondsUntilSet]]"
          waiting-for-network="[[_waitingForNetwork]]"
          current-time="[[showStatus.currentTime]]"
          audio-paused="[[audioStatus.paused]]"
          reduce-motion="[[_reduceMotion]]"
          get-audio-visualizer-data="[[getAudioVisualizerData]]"
        ></festival-ui-playing>
      </template>
      <template is="dom-if" if="[[_stampEnded]]">
        <festival-ui-ended hidden$="[[!_ended]]"></festival-ui-ended>
      </template>
      <toast-sk id="toast" duration="0">
        <span id="toast-message"></span>
        <button on-click="_reload">Reload</button>
        <button on-click="_hideToast" hidden$="[[_error]]">Close</button>
      </toast-sk>
    `;
  }

  static get properties() {
    return {
      showStatus: Object,
      audioStatus: Object,
      getAudioVisualizerData: Function,
      _error: Boolean,
      _alertShown: Boolean,
      _reduceMotion: Boolean,
      _waitingForAudioContext: {
        type: Boolean,
        computed: '_computeWaitingForAudioContext(showStatus.status)',
      },
      _waitingUntilStart: {
        type: Boolean,
        computed: '_computeWaitingUntilStart(showStatus.status)',
      },
      _waitingForNetwork: {
        type: Boolean,
        computed: '_computeWaiting(showStatus.status, audioStatus.waiting)',
      },
      _playing: {
        type: Boolean,
        computed: '_computePlaying(showStatus.status)',
      },
      _showPlaying: {
        type: Boolean,
        computed:
          '_computeShowPlaying(_waitingUntilStart, _waitingForNetwork, _playing)',
      },
      _ended: {
        type: Boolean,
        computed: '_computeEnded(showStatus.status)',
        observer: '_endedChanged',
      },
      _stampEnded: {
        type: Boolean,
        value: false,
      },
    };
  }

  static get observers() {
    return [
      '_delayChanged(showStatus.delay)',
      '_audioStalledChanged(audioStatus.stalled)',
    ];
  }

  ready() {
    super.ready();

    setTimeout(() => {
      this._stampEnded = true;
    }, 10 * 1000);
  }

  connectedCallback() {
    super.connectedCallback();

    this._motionMediaQuery = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    );
    this._motionMediaQueryChanged = () => {
      this._reduceMotion = this._motionMediaQuery.matches;
    };
    // In Safari, MediaQueryList doesn't inherit from EventTarget
    // This means that we must use addListener instead of addEventListener
    this._motionMediaQuery.addListener(this._motionMediaQueryChanged);
    this._motionMediaQueryChanged();
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    this._motionMediaQuery.removeEventListener(
      'change',
      this._motionMediaQueryChanged
    );
  }

  stateChanged(state) {
    this.showStatus = state.showStatus;
    this.audioStatus = state.audioStatus;

    if (state.ui.errorLoading) this._showLoadingError();
  }

  showAudioError() {
    const verb = this._waitingUntilStart ? 'loading' : 'playing';
    this._showError(`There was a problem ${verb} the audio track.`);
  }

  _showLoadingError() {
    this._showError('There was a problem loading the show data.');
  }

  _showError(text) {
    this._error = true;
    this.$['toast-message'].textContent = text;
    this.$.toast.show();
    this._alertShown = true;
  }

  _audioStalledChanged(stalled) {
    if (this._alertShown) return;
    if (this._waitingUntilStart || this._ended) return;

    if (stalled) {
      this.$['toast-message'].textContent =
        'Looks like your internet connection is having trouble.';
      this.$.toast.show();
      this._alertShown = true;
    }
  }

  _computeWaitingForAudioContext(status) {
    return status === 'WAITING_FOR_AUDIO_CONTEXT';
  }

  _computeWaitingUntilStart(status) {
    return status === 'WAITING_UNTIL_START';
  }

  _computeWaiting(status, waiting) {
    return status === 'DELAYING_FOR_INITIAL_SYNC' || waiting;
  }

  _computePlaying(status) {
    return status === 'PLAYING';
  }

  _computeShowPlaying(_waitingUntilStart, _waitingForNetwork, _playing) {
    return _waitingUntilStart || _waitingForNetwork || _playing;
  }

  _computeEnded(status) {
    return status === 'ENDED';
  }

  _endedChanged(_ended) {
    if (_ended) {
      this._stampEnded = true;
      this._hideToast();
    }
  }

  _delayChanged(delay) {
    if (this._alertShown) return;
    if (this._waitingUntilStart || this._ended) return;

    if (delay >= 30) {
      this.$['toast-message'].textContent =
        'Looks like your audio player is out of sync.';
      this.$.toast.show();
      this._alertShown = true;
    }
  }

  _reload() {
    window.location.reload();
  }

  _hideToast() {
    this.$.toast.hide();
  }
}

window.customElements.define('festival-ui', FestivalUi);
