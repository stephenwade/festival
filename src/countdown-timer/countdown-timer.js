import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';
import moment from 'moment/src/moment.js';

/**
 * @customElement
 * @polymer
 */
export class CountdownTimer extends PolymerElement {
  static get template() {
    return html`
      <style>
        :host {
          color: white;
          font-size: 40px;
        }
      </style>
      [[setsDescription]]
    `;
  }

  static get properties() {
    return {
      sets: {
        type: Object
      },
      setsDescription: {
        type: String,
        computed: 'describeSets(sets)'
      }
    };
  }

  describeSets(sets) {
    return `The next set starts ${moment().to(sets[0].start)}.`;
  }
}

window.customElements.define('countdown-timer', CountdownTimer);
