import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';
import '@polymer/paper-button/paper-button.js';
import moment from 'moment/src/moment.js';

/**
 * @customElement
 * @polymer
 */
export class FestivalWaiting extends PolymerElement {
  static get template() {
    return html`
      <style>
        :host {
          font-size: 40px;
          text-align: center;
        }

        paper-button {
          background-color: #ffb74d; /* material orange 300 */
          color: #000;
          border-radius: 8px;
          transition: min-width 0.25s ease-out;
          min-width: 5em;
        }

        paper-button[disabled] {
          background-color: rgba(255, 255, 255, 0.12);
          min-width: 14em;
        }
      </style>
      <p>The first set starts:<br />[[_startTimeDescription]].</p>
      <p>
        <paper-button
          raised
          disabled="[[!_canJoin]]"
          on-click="_handleJoinClicked"
        >
          [[_joinButtonText]]
        </paper-button>
      </p>
    `;
  }

  static get properties() {
    return {
      sets: {
        type: Object
      },
      _now: {
        type: moment
      },
      _startTime: {
        type: moment,
        computed: '_computeStartTime(sets)'
      },
      _startTimeDescription: {
        type: String,
        computed: '_computeStartTimeDescription(_startTime)'
      },
      _joinTime: {
        type: moment,
        computed: '_computeJoinTime(_startTime)'
      },
      _canJoin: {
        type: Boolean,
        computed: '_computeCanJoin(_joinTime, _now)'
      },
      _joinButtonText: {
        type: String,
        computed: '_computeJoinButtonText(_canJoin, _joinTime, _now)'
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

  _computeStartTime(sets) {
    return moment(sets[0].start);
  }

  _computeStartTimeDescription(_startTime) {
    return _startTime.calendar(null, {
      sameElse: function(now) {
        return (
          'dddd, MMMM D' +
          (this.year() === now.year() ? '' : ', YYYY') +
          ' [at] h:mm A'
        );
      }
    });
  }

  _computeJoinTime(_startTime) {
    return _startTime.clone().subtract(1, 'hour');
  }

  _computeCanJoin(_joinTime, _now) {
    if (_joinTime && _now) {
      return _now.isAfter(_joinTime);
    }
    return false;
  }

  _computeJoinButtonText(_canJoin, _joinTime, _now) {
    if (_joinTime && _now)
      return 'Join' + (_canJoin ? '' : ' ' + _now.to(_joinTime));
  }

  _updateNow() {
    this._now = moment();
  }

  _handleJoinClicked() {
    this.dispatchEvent(new CustomEvent('join'));
  }
}

window.customElements.define('festival-waiting', FestivalWaiting);
