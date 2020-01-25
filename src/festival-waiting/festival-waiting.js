import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';

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
        }
      </style>
      Click to join
    `;
  }
}

window.customElements.define('festival-waiting', FestivalWaiting);
