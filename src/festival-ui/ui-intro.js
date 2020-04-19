import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';
import '@polymer/polymer/lib/elements/dom-if.js';
import '@polymer/iron-image/iron-image.js';
import '@polymer/paper-button/paper-button.js';

export class UiIntro extends PolymerElement {
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
          position: absolute;
          top: 50%;
          left: 50%;
          -webkit-transform: translateX(-50%) translateY(-50%);
          transform: translateX(-50%) translateY(-50%);
          text-align: center;
          padding: 0 1em;
        }

        #logo {
          display: block;
          width: 100%;
          max-width: 900px;
          margin: 2em auto;
        }

        #buttons {
          width: 100%;
          font-size: 2em;
          background: var(--gradient-background);
          background-size: 100% auto;
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
      <a href="https://twitter.com/URLFESTIVAL">
        <iron-image
          id="logo"
          src="images/fest2fest-logo.svg"
          preload
          loaded="{{_logoLoaded}}"
        ></iron-image
      ></a>
      <template is="dom-if" if="[[_logoLoaded]]">
        <div id="buttons">
          <paper-button id="button-listen" on-click="_handleListenClicked">
            Listen Live
          </paper-button>
          <a href="https://discord.io/festival" target="_blank" tabindex="-1">
            <paper-button id="button-discord">Join Discord</paper-button>
          </a>
        </div>
      </template>
    `;
  }

  _handleListenClicked() {
    this.dispatchEvent(
      new CustomEvent('listen', { bubbles: true, composed: true })
    );
  }
}

window.customElements.define('ui-intro', UiIntro);
