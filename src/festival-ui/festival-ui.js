import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';
import '@polymer/polymer/lib/elements/dom-if.js';
import '@polymer/paper-toast/paper-toast.js';
import '@polymer/paper-button/paper-button.js';
import './ui-ended.js';
import './ui-intro.js';
import './ui-playing.js';
import './ui-waiting.js';

export class FestivalUi extends PolymerElement {
  static get template() {
    return html`
      <style>
        :host {
          box-sizing: border-box;
        }
        *,
        *:before,
        *:after {
          box-sizing: inherit;
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

        paper-toast paper-button + paper-button {
          margin-left: -1em;
        }

        paper-toast paper-button:last-child {
          margin-right: -1em;
        }
      </style>
      <template is="dom-if" if="[[_waitingForAudioContext]]">
        <ui-intro></ui-intro>
      </template>
      <template is="dom-if" if="[[_waitingUntilStart]]">
        <ui-waiting
          set="[[audioStatus.set]]"
          seconds-until-set="[[audioStatus.secondsUntilSet]]"
        ></ui-waiting>
      </template>
      <template is="dom-if" if="[[_showPlaying]]">
        <ui-playing
          set="[[audioStatus.set]]"
          waiting="[[_waiting]]"
          current-time="[[audioStatus.currentTime]]"
          get-audio-visualizer-data="[[getAudioVisualizerData]]"
        ></ui-playing>
      </template>
      <template is="dom-if" if="[[_ended]]">
        <ui-ended></ui-ended>
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
      _stalledAlertShown: {
        type: Boolean,
        value: false,
      },
      _waitingForAudioContext: {
        type: Boolean,
        computed: '_computeWaitingForAudioContext(audioStatus.status)',
      },
      _waitingUntilStart: {
        type: Boolean,
        computed: '_computeWaitingUntilStart(audioStatus.status)',
      },
      _waiting: {
        type: Boolean,
        computed: '_computeWaiting(audioStatus.status, audioWaiting)',
      },
      _playing: {
        type: Boolean,
        computed: '_computePlaying(audioStatus.status)',
      },
      _showPlaying: {
        type: Boolean,
        computed: '_computeShowPlaying(_waiting, _playing)',
      },
      _ended: {
        type: Boolean,
        computed: '_computeEnded(audioStatus.status)',
        observer: '_endedChanged',
      },
    };
  }

  showError() {
    this._error = true;
    const verb = this._showPlaying ? 'playing' : 'loading';
    this.$.toast.text = `There was a problem ${verb} the audio track.`;
    this.$.toast.show();
  }

  _audioStalledChanged(audioStalled) {
    if (this._error || this._stalledAlertShown) return;

    if (audioStalled) {
      this.$.toast.text =
        'Looks like your internet connection is having trouble.';
      this.$.toast.show();
      this._stalledAlertShown = true;
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

  _computeShowPlaying(_waiting, _playing) {
    return _waiting || _playing;
  }

  _computeEnded(status) {
    return status === 'ENDED';
  }

  _endedChanged(_ended) {
    if (_ended) this._hideToast();
  }

  _reload() {
    window.location.reload();
  }

  _hideToast() {
    this.$.toast.hide();
  }
}

window.customElements.define('festival-ui', FestivalUi);
