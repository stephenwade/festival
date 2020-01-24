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
      Counting down…
    `;
  }
}

window.customElements.define('countdown-timer', CountdownTimer);
