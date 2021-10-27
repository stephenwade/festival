import { LitElement, html, css } from 'lit';

import {
  boxSizingBorderBox,
  flexColumnCenter,
  fullPage,
} from './shared-styles.js';
import { elevationZ2 } from './shared-styles-elevation.js';

class FestivalUiIntroPage extends LitElement {
  static get styles() {
    return [
      boxSizingBorderBox,
      fullPage,
      flexColumnCenter,
      elevationZ2,
      css`
        :host {
          padding: 0 1em;
        }

        #logo-link {
          width: 100%;
          max-width: 900px;
          margin-bottom: 2em;
        }

        #logo {
          display: block;
          width: 100%;
          margin-top: 0.5em; /* balance out bottom margin on buttons */
        }

        #buttons {
          font-size: 2em;
          text-align: center;
        }

        #buttons span {
          display: inline-block;
          margin: 0 0.2em 0.5em;
          border-radius: 5px;
          transform: skew(-10deg);
        }

        #buttons a {
          display: inline-block;
          padding: 0.5em 1em;
          border-radius: 5px;
          background-color: white;
          color: var(--background-color);
          font-weight: bold;
          text-decoration: none;
          text-transform: uppercase;
        }

        #buttons a:active {
          background-color: rgb(255 255 255 / 80%);
        }
      `,
    ];
  }

  render() {
    return html`
      <a
        id="logo-link"
        href="https://twitter.com/URLFESTIVAL"
        target="_blank"
        rel="noopener"
        ?hidden=${!this._logoLoaded}
      >
        <img
          id="logo"
          src="images/impulse-logo.png"
          alt="Impulse Music Festival"
          @load="${this._handleLogoLoaded}"
        />
      </a>
      <div id="buttons" ?hidden=${!this._logoLoaded}>
        <span class="mdc-elevation--z2">
          <a href="/my-show/live" @click="${this._handleListenClicked}">
            Listen Live
          </a>
        </span>
        <span class="mdc-elevation--z2">
          <a href="https://discord.io/festival" target="_blank" rel="noopener">
            Join Discord
          </a>
        </span>
      </div>
    `;
  }

  static get properties() {
    return {
      _logoLoaded: { attribute: false },
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

customElements.define('festival-ui-intro-page', FestivalUiIntroPage);
