import { LitElement, html, css } from 'lit';

import { boxSizingBorderBox, flexColumnCenter } from './shared-styles.js';

class FestivalUiEnded extends LitElement {
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
      >
        <img id="logo" src="images/cubed-logo.png" alt="FESTIVAL CUBED" />
      </a>
      <a href="https://twitter.com/URLFESTIVAL" target="_blank" rel="noopener">
        <img id="heart" src="images/heart-white.svg" alt="heart" />
      </a>
    `;
  }
}

customElements.define('festival-ui-ended', FestivalUiEnded);
