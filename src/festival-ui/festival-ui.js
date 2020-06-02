import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';
import '@polymer/polymer/lib/elements/dom-if.js';
import '@polymer/paper-toast/paper-toast.js';
import '@polymer/paper-button/paper-button.js';
import './ui-ended.js';
import './ui-intro.js';
import './ui-playing.js';

export class FestivalUi extends PolymerElement {
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
          /*
          background: var(--gradient-background);
          background-size: 100% auto;
          */
          background: url('/images/dnb-break-67-waves.svg'), var(--background);
          background-size: calc(50vw + 30em) auto;
          background-position: center right -20em;
          background-repeat: no-repeat;
        }

        paper-toast paper-button:first-of-type {
          margin-right: -0.5em;
        }

        paper-toast paper-button + paper-button {
          margin-left: -0.5em;
        }

        paper-toast paper-button:last-child {
          margin-right: -1em;
        }
      </style>
      <template is="dom-if" if="[[_waitingForAudioContext]]">
        <ui-intro></ui-intro>
      </template>
      <template is="dom-if" if="[[_showPlaying]]">
        <ui-playing
          set="[[audioStatus.set]]"
          waiting-until-start="[[_waitingUntilStart]]"
          seconds-until-set="[[audioStatus.secondsUntilSet]]"
          waiting-for-network="[[_waitingForNetwork]]"
          current-time="[[audioStatus.currentTime]]"
          audio-paused="[[audioPaused]]"
          reduce-motion="[[_reduceMotion]]"
          get-audio-visualizer-data="[[getAudioVisualizerData]]"
        ></ui-playing>
      </template>
      <template is="dom-if" if="[[_stampEnded]]">
        <ui-ended hidden$="[[!_ended]]"></ui-ended>
      </template>
      <paper-toast id="toast" duration="0">
        <paper-button on-click="_reload">Reload</paper-button>
        <paper-button on-click="_hideToast" hidden$="[[_error]]">
          Close
        </paper-button>
      </paper-toast>
    `;
  }

  static get properties() {
    return {
      audioStatus: Object,
      audioWaiting: Boolean,
      audioStalled: {
        type: Boolean,
        observer: '_audioStalledChanged',
      },
      getAudioVisualizerData: Function,
      _error: Boolean,
      _alertShown: Boolean,
      _reduceMotion: Boolean,
      _waitingForAudioContext: {
        type: Boolean,
        computed: '_computeWaitingForAudioContext(audioStatus.status)',
      },
      _waitingUntilStart: {
        type: Boolean,
        computed: '_computeWaitingUntilStart(audioStatus.status)',
      },
      _waitingForNetwork: {
        type: Boolean,
        computed: '_computeWaiting(audioStatus.status, audioWaiting)',
      },
      _playing: {
        type: Boolean,
        computed: '_computePlaying(audioStatus.status)',
      },
      _showPlaying: {
        type: Boolean,
        computed:
          '_computeShowPlaying(_waitingUntilStart, _waitingForNetwork, _playing)',
      },
      _ended: {
        type: Boolean,
        computed: '_computeEnded(audioStatus.status)',
        observer: '_endedChanged',
      },
      _stampEnded: {
        type: Boolean,
        value: false,
      },
    };
  }

  static get observers() {
    return ['_delayChanged(audioStatus.delay)'];
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

  showAudioError() {
    const verb = this._waitingUntilStart ? 'loading' : 'playing';
    this._showError(`There was a problem ${verb} the audio track.`);
  }

  showLoadingError() {
    this._showError('There was a problem loading the show data.');
  }

  _showError(text) {
    this._error = true;
    this.$.toast.text = text;
    this.$.toast.show();
    this._alertShown = true;
  }

  _audioStalledChanged(audioStalled) {
    if (this._alertShown) return;
    if (this._waitingUntilStart || this._ended) return;

    if (audioStalled) {
      this.$.toast.text =
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

  _computeWaiting(status, audioWaiting) {
    return status === 'DELAYING_FOR_INITIAL_SYNC' || audioWaiting;
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
      this.$.toast.text = 'Looks like your audio player is out of sync.';
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
