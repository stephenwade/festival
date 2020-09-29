import { LitElement, html, css } from 'lit-element';
import { connect } from 'pwa-helpers/connect-mixin.js';

import '../../lib/toast-sk/toast-sk.js';
import { store } from '../store.js';
import './festival-ui-ended.js';
import './festival-ui-intro.js';
import './festival-ui-playing.js';
import { boxSizingBorderBox, fullPageClass } from './shared-styles.js';

export class FestivalUi extends connect(store)(LitElement) {
  static get styles() {
    return [
      boxSizingBorderBox,
      fullPageClass,
      css`
        :host {
          font-family: 'HelveticaNeue-Light', 'Helvetica Neue Light',
            'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif;

          user-select: none;
        }

        [hidden] {
          display: none !important;
        }

        toast-sk {
          padding: 0.7em 1.5em;
          border-radius: 3px;

          background-color: #323232;
          color: #f1f1f1;
        }

        toast-sk button {
          min-width: 5em;
          padding: 0.7em 0.7em;
          border: none;
          margin: 0 0.3em;

          background-color: inherit;
          color: inherit;
          font-family: inherit;
          font-size: inherit;
          line-height: inherit;
          text-transform: uppercase;

          cursor: pointer;
        }
        toast-sk button::-moz-focus-inner {
          padding: 0;
          border-style: none;
        }
        toast-sk button:-moz-focusring {
          outline: 1px dotted ButtonText;
        }

        /* stylelint-disable-next-line no-descending-specificity */
        toast-sk button + button {
          margin-left: -0.5em;
        }
        toast-sk button:first-of-type {
          margin-right: -0.5em;
        }
        toast-sk button:last-child {
          margin-right: -1em;
        }
      `,
    ];
  }

  render() {
    return html`
      ${this._waitingForAudioContext
        ? html`<festival-ui-intro class="full-page"></festival-ui-intro>`
        : null}
      ${this._waitingUntilStart || this._waitingForNetwork || this._playing
        ? html`
            <festival-ui-playing
              class="full-page"
              .set="${this._showStatus.set}"
              .waitingUntilStart="${this._waitingUntilStart}"
              .secondsUntilSet="${this._showStatus.secondsUntilSet}"
              .waitingForNetwork="${this._waitingForNetwork}"
              .currentTime="${this._showStatus.currentTime}"
              .audioPaused="${this._audioStatus.paused}"
              .reduceMotion="${this._reduceMotion}"
              .getAudioVisualizerData="${this.getAudioVisualizerData}"
            ></festival-ui-playing>
          `
        : null}
      ${this._stampEnded || this._ended
        ? html`
            <festival-ui-ended
              class="full-page"
              ?hidden="${!this._ended}"
            ></festival-ui-ended>
          `
        : null}
      <toast-sk id="toast" duration="0">
        <span id="toast-message">${this._toastMessage}</span>
        <button @click="${() => window.location.reload()}">Reload</button>
        <button @click="${this._hideToast}" ?hidden="${this._error}">
          Close
        </button>
      </toast-sk>
    `;
  }

  static get properties() {
    return {
      _showStatus: { attribute: false },
      _audioStatus: { attribute: false },
      getAudioVisualizerData: { attribute: false },
      _error: { attribute: false },
      _alertShown: { attribute: false },
      _reduceMotion: { attribute: false },
      _waitingForAudioContext: { attribute: false },
      _waitingUntilStart: { attribute: false },
      _waitingForNetwork: { attribute: false },
      _playing: { attribute: false },
      _ended: { attribute: false },
      _stampEnded: { attribute: false },
      _toastMessage: { attribute: false },
    };
  }

  shouldUpdate() {
    if (this._showStatus.delay !== this._lastDelay) this._delayChanged();
    if (this._audioStatus.stalled !== this._lastStalled)
      this._audioStalledChanged();

    this._lastDelay = this._showStatus.delay;
    this._lastStalled = this._audioStatus.stalled;

    return true;
  }

  firstUpdated() {
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
    // https://developer.mozilla.org/en-US/docs/Web/API/MediaQueryList#Browser_compatibility
    this._motionMediaQuery.addListener(this._motionMediaQueryChanged);
    this._motionMediaQueryChanged();
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    // In Safari, MediaQueryList doesn't inherit from EventTarget
    // This means that we must use removeListener instead of removeEventListener
    // https://developer.mozilla.org/en-US/docs/Web/API/MediaQueryList#Browser_compatibility
    this._motionMediaQuery.removeListener(this._motionMediaQueryChanged);
  }

  stateChanged(state) {
    this._showStatus = state.showStatus;
    this._audioStatus = state.audioStatus;

    this._waitingForAudioContext =
      this._showStatus.status === 'WAITING_FOR_AUDIO_CONTEXT';
    this._waitingUntilStart = this._showStatus.status === 'WAITING_UNTIL_START';
    this._waitingForNetwork =
      this._showStatus.status === 'DELAYING_FOR_INITIAL_SYNC' ||
      this._audioStatus.waiting;
    this._playing = this._showStatus.status === 'PLAYING';
    this._ended = this._showStatus.status === 'ENDED';

    this.requestUpdate();

    if (this._ended) this._hideToast();
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
    this._toastMessage = text;
    this.shadowRoot.getElementById('toast').show();
    this._alertShown = true;
  }

  _audioStalledChanged() {
    if (this._alertShown) return;
    if (this._waitingUntilStart || this._ended) return;

    if (this._audioStatus.stalled) {
      this._toastMessage =
        'Looks like your internet connection is having trouble.';
      this.shadowRoot.getElementById('toast').show();
      this._alertShown = true;
    }
  }

  _delayChanged() {
    if (this._alertShown) return;
    if (this._waitingUntilStart || this._ended) return;

    if (this._showStatus.delay >= 30) {
      this._toastMessage = 'Looks like your audio player is out of sync.';
      this.shadowRoot.getElementById('toast').show();
      this._alertShown = true;
    }
  }

  _hideToast() {
    this.shadowRoot.getElementById('toast').hide();
  }
}

window.customElements.define('festival-ui', FestivalUi);
