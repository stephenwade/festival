import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';
import moment from 'moment/src/moment.js';

export class NowPlaying extends PolymerElement {
  static get template() {
    return html`
      The first set starts:<br />[[_startTimeDescription]]
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
}

window.customElements.define('now-playing', NowPlaying);
