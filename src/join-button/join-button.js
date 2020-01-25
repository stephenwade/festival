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
          padding-left: 30px;
          padding-right: 30px;
          font-size: 100px;
          user-select: none;
          font-weight: 100;
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
