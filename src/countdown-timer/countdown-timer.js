import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';

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
