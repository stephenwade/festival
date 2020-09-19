import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';
import '@polymer/polymer/lib/elements/dom-if.js';
import '@polymer/paper-button/paper-button.js';

export class FestivalUiIntro extends PolymerElement {
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
          padding: 0 1em;
          background: var(--gradient-background);
          background-size: 100% auto;
        }

        #logo-link {
          width: 100%;
        }

        #logo {
          display: block;
          width: 100%;
          max-width: 900px;
          margin: 2em auto;
        }

        #buttons {
          font-size: 2em;
          margin-bottom: 0.5em;
        }

        paper-button {
          background: white;
          font-weight: bold;
          border-radius: 5px;
          padding: 0.5em 1em;
          margin-bottom: 0.5em;
          transform: skew(-10deg);

          /* gradient cutout */
          color: black;
          --paper-button-ink-color: black;
          mix-blend-mode: screen;
        }

        a {
          text-decoration: none;
          -webkit-tap-highlight-color: transparent;
        }
      </style>
      <a
        id="logo-link"
        href="https://twitter.com/URLFESTIVAL"
        target="_blank"
        rel="noopener"
      >
        <img
          id="logo"
          src="images/festiv4l-logo.svg"
          alt="FESTIV4L"
          on-load="_handleLogoLoaded"
        />
      </a>
      <template is="dom-if" if="[[_logoLoaded]]">
        <div id="buttons">
          <paper-button id="button-listen" on-click="_handleListenClicked">
            Listen Live
          </paper-button>
          <a
            href="https://discord.io/festival"
            target="_blank"
            rel="noopener"
            tabindex="-1"
          >
            <paper-button id="button-discord">Join Discord</paper-button>
          </a>
        </div>
      </template>
    `;
  }

  static get properties() {
    return {
      _logoLoaded: Boolean,
    };
  }

  _handleLogoLoaded() {
    this._logoLoaded = true;
  }

  _handleListenClicked() {
    this.dispatchEvent(
      new CustomEvent('listen', { bubbles: true, composed: true })
    );
  }
}

window.customElements.define('festival-ui-intro', FestivalUiIntro);
