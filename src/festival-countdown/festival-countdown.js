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
      _now: {
        type: moment
      },
      _duration: {
        type: moment.duration,
        computed: '_computeDuration(to, _now)',
        observer: '_observeDuration'
      },
      _countdownText: {
        type: String,
        computed: '_computeCountdownText(_duration)'
      }
    };
  }

  connectedCallback() {
    super.connectedCallback();
    this._updateNow();
    this._nowInterval = setInterval(() => {
      this._updateNow();
    }, 1000);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    clearInterval(this._nowInterval);
  }

  _computeDuration(to, _now) {
    const m = moment(to);
    return moment.duration(m.diff(_now));
  }

  _observeDuration(_duration) {
    const seconds = Math.trunc(_duration.asSeconds());
    if (seconds === 2) {
      this.dispatchEvent(
        new CustomEvent('countdown-ending', { bubbles: true })
      );
    }
    if (seconds <= 0) {
      this.dispatchEvent(
        new CustomEvent('countdown-finished', { bubbles: true })
      );
    }
  }

  _computeCountdownText(_duration) {
    const minutes = _duration.minutes();
    const seconds = _duration.seconds();
    if (minutes > 0 && seconds > 0)
      return String(minutes) + ':' + String(seconds).padStart(2, '0');
    return '0:00';
  }

  _updateNow() {
    this._now = moment();
  }
}

window.customElements.define('festival-countdown', FestivalCountdown);
