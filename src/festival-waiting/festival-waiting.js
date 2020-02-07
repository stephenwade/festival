import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/polymer/lib/elements/dom-if.js';
import moment from 'moment/src/moment.js';
import '../festival-countdown/festival-countdown.js';
import '../now-playing/now-playing.js';

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
      <template is="dom-if" if="[[!joined]]">
        <p>
          <now-playing sets="[[sets]]"></now-playing>
        </p>
        <p>
          <paper-button raised on-click="_handleJoinClicked">Join</paper-button>
        </p>
      </template>
      <template is="dom-if" if="[[joined]]">
        <festival-countdown
          to="[[_startTime]]"
          seconds="{{seconds}}"
        ></festival-countdown>
      </template>
    `;
  }

  static get properties() {
    return {
      sets: {
        type: Object
      },
      joined: {
        type: Boolean,
        value: false
      },
      seconds: {
        type: Number,
        notify: true
      },
      _now: {
        type: moment
      },
      _startTime: {
        type: moment,
        computed: '_computeStartTime(sets)'
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

  _updateNow() {
    this._now = moment();
  }

  _handleJoinClicked() {
    this.joined = true;
    this.dispatchEvent(new CustomEvent('join'));
  }
}

window.customElements.define('festival-waiting', FestivalWaiting);
