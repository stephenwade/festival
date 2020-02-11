import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';
import moment from 'moment/src/moment.js';

export class FestivalCountdown extends PolymerElement {
  static get template() {
    return html`
      [[_countdownText]]
    `;
  }

  static get properties() {
    return {
      to: {
        type: Number
      },
      seconds: {
        type: Number,
        notify: true
      },
      _countdownText: {
        type: String,
        computed: '_computeCountdownText(seconds)'
      }
    };
  }

  connectedCallback() {
    super.connectedCallback();

    this._updateSeconds();
    if (this.seconds > 0) {
      this._secondsInterval = setTimeout(() => {
        this._updateSeconds();
        this._secondsInterval = setInterval(() => {
          this._updateSeconds();
        }, 1000);
      }, this._getTimeUntilNextSecond() * 1000);
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    clearInterval(this._secondsInterval);
  }

  _computeCountdownText(totalSeconds) {
    if (totalSeconds < 0) return '0:00';
    const minutes = Math.trunc(totalSeconds / 60);
    const seconds = Math.trunc(totalSeconds % 60);
    return String(minutes) + ':' + String(seconds).padStart(2, '0');
  }

  _getTimeUntilNextSecond() {
    const m = moment(this.to);
    const duration = moment.duration(m.diff(moment()));
    const seconds = duration.asSeconds();
    return seconds % 1;
  }

  _updateSeconds() {
    const m = moment(this.to);
    const duration = moment.duration(m.diff(moment()));
    const seconds = duration.asSeconds();
    this.seconds = seconds;

    if (seconds < 0 && this._secondsInterval)
      clearInterval(this._secondsInterval);
  }
}

window.customElements.define('festival-countdown', FestivalCountdown);
