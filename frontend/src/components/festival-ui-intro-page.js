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
          margin-bottom: 0.2em;
          font-size: 2em;
          text-align: center;
        }

        #buttons a {
          position: relative;
          display: inline-block;
          width: 12em;
          margin: 0 0.2em 0.5em;
          padding: 0.2em 1em 0.35em;
          border-top: 2px solid #afafaf;
          border-right: 2px solid #565656;
          border-bottom: 4px solid #565656;
          border-left: 2px solid #afafaf;
          background: #757575;
          color: white;
          font-family: 'Minecraft', monospace;
          letter-spacing: 1.3px;
          text-decoration: none;
          text-shadow: 0.1em 0.1em #3f3f3f;
        }
        #buttons a::before {
          content: '';
          position: absolute;
          top: -4px;
          right: -4px;
          bottom: -6px;
          left: -4px;
          display: block;
          border: 2px solid #000;
          background: none;
          pointer-events: none;
        }
        #buttons a:hover::before {
          border-color: #fff;
        }

        #minecraft {
          margin: 0 0.2em 0.5em;
          color: white;
          font-size: 1.5em;
          font-family: 'Minecraft', monospace;
          text-align: center;
        }

        #minecraft-url {
          color: #fcfc00;
          font-size: 1.5em;
          text-shadow: 0.1em 0.1em #3e3e00;
          user-select: text;
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
          src="images/cubed-logo.png"
          alt="FESTIVAL CUBED"
          @load="${this._handleLogoLoaded}"
        />
      </a>
      <div id="buttons" ?hidden=${!this._logoLoaded}>
        <span class="mdc-elevation--z2">
          <a href="/cubed/live" @click="${this._handleListenClicked}">
            Listen Live
          </a>
        </span>
        <span class="mdc-elevation--z2">
          <a href="https://discord.io/festival" target="_blank" rel="noopener">
            Join Discord
          </a>
        </span>
      </div>
      <div id="minecraft">
        <div id="minecraft-label">Join us in Minecraft!</div>
        <div id="minecraft-url">mc.urlfest.com</div>
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
