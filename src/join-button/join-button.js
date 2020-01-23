import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';

/**
 * @customElement
 * @polymer
 */
export class JoinButton extends PolymerElement {
  static get template() {
    return html`
      <style>
        .button {
          transition: all 0.2s;
          background-color: #fda50fd0;
          height: 150px;
          border-radius: 150px;
          line-height: 150px;
          color: #fffa;
          padding-left: 30px;
          padding-right: 30px;
          font-size: 100px;
          font-family: 'Roboto', sans-serif;
          font-weight: 100;
          user-select: none;
        }

        .button:hover {
          background-color: #fda50f !important;
        }
      </style>
      <div class="button">
        Join FESTIVAL
      </div>
    `;
  }
}

window.customElements.define('join-button', JoinButton);
