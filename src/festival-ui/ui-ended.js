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
          max-width: 580px;
          margin: 2em auto;
        }

        #heart {
          display: block;
          width: 9em;
          margin: 3em 0 2em 0;
        }

        a {
          text-decoration: none;
          -webkit-tap-highlight-color: transparent;
          width: 100%;
        }

        #wrapper {
          width: 100%;
          max-width: 580px;
        }
      </style>
      <div id="wrapper">
        <a
          href="https://twitter.com/URLFESTIVAL"
          target="_blank"
          rel="noopener"
        >
          <img id="logo" src="images/dnb-break-67-logo.svg" alt="FESTIV4L" />
        </a>
        <a
          href="https://twitter.com/URLFESTIVAL"
          target="_blank"
          rel="noopener"
        >
          <img id="heart" src="images/heart-white.svg" alt="heart" />
        </a>
      </div>
    `;
  }
}

window.customElements.define('ui-ended', UiEnded);
