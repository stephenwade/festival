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
        }
      </style>
      <p>The first set starts:<br />[[startTimeDescription]].</p>
      <p><paper-button raised>Join</paper-button></p>
    `;
  }

  static get properties() {
    return {
      sets: {
        type: Object
      },
      startTimeDescription: {
        type: String,
        computed: '_computeStartTimeDescription(sets)'
      }
    };
  }

  _computeStartTimeDescription(sets) {
    const startTime = sets[0].start;
    return moment(startTime).calendar(null, {
      sameElse: function(now) {
        return 'dddd, MMMM D' + (this.year() === now.year() ? '' : ', YYYY') + ' [at] h:mm A';
      }
    });
  }
}

window.customElements.define('festival-waiting', FestivalWaiting);
