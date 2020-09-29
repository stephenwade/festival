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
        }

        #buttons {
          font-size: 2em;
        }

        #buttons a {
          display: inline-block;
          padding: 0.5em 1em;
          border-radius: 5px;
          margin: 0 0.2em;
          transform: skew(-10deg);

          background: white;
          font-weight: bold;
          text-decoration: none;
          text-transform: uppercase;

          /* gradient cutout */
          color: black;
          mix-blend-mode: screen;
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
          src="images/fe5tival-logo.svg"
          alt="FE5TIVAL"
          @load="${this._handleLogoLoaded}"
        />
      </a>
      <div id="buttons" ?hidden=${!this._logoLoaded}>
        <a href="#" @click="${this._handleListenClicked}">Listen Live</a>
        <a href="https://discord.io/festival" target="_blank" rel="noopener">
          Join Discord
        </a>
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
