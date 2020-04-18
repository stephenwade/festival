import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';

export class UiEnded extends PolymerElement {
  static get template() {
    return html`
      <style>
        :host {
          box-sizing: border-box;
        }
        *,
        *:before,
        *:after {
          box-sizing: inherit;
        }

        :host {
          color: white;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 0 1em;
          text-transform: uppercase;
        }

        #logo {
          display: block;
          width: 100%;
          max-width: 650px;
          margin: 2em auto;
        }

        #heart {
          display: block;
          width: 12vw;
          margin: 2em auto;
        }

        a {
          text-decoration: none;
          -webkit-tap-highlight-color: transparent;
          width: 100%;
        }
      </style>
      <a href="https://twitter.com/URLFESTIVAL">
        <img id="logo" src="images/dnb-break-66-logo.svg" />
      </a>
      <a href="https://twitter.com/URLFESTIVAL">
        <img id="heart" src="images/heart.svg" />
      </a>
    `;
  }
}

window.customElements.define('ui-ended', UiEnded);
