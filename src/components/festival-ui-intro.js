import { LitElement, html, css } from 'lit-element';

import { boxSizingBorderBox, flexColumnCenter } from './shared-styles.js';

export class FestivalUiIntro extends LitElement {
  static get styles() {
    return [
      boxSizingBorderBox,
      flexColumnCenter,
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
        href="https://twitter.com/bassheritageoff"
        target="_blank"
        rel="noopener"
        ?hidden=${!this._logoLoaded}
      >
        <picture>
          <source srcset="images/obxidion-logo.webp" type="image/webp" />
          <img
            id="logo"
            src="images/obxidion-logo.png"
            alt="FUNDRAISER FOR OBXIDION"
            @load="${this._handleLogoLoaded}"
          />
        </picture>
      </a>
      <div id="buttons" ?hidden=${!this._logoLoaded}>
        <a href="#" @click="${this._handleListenClicked}">Listen Live</a>
        <a href="https://cash.app/$OBXIDION" target="_blank" rel="noopener">
          Donate
        </a>
      </div>
      <div id="minecraft">
        <div id="minecraft-label">Join us in Minecraft!</div>
        <div id="minecraft-url">burningblocks.play-mc.net</div>
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

window.customElements.define('festival-ui-intro', FestivalUiIntro);
