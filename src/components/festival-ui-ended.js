import { LitElement, html, css } from 'lit-element';

import { boxSizingBorderBox, flexColumnCenter } from './shared-styles.js';

export class FestivalUiEnded extends LitElement {
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

        #heart {
          display: block;
          width: clamp(5em, 18vmin, 9em);
          margin-top: 1em;
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
        <img
          id="logo"
          src="images/impulse-logo.png"
          alt="Impulse Music Festival"
        />
      </a>
      <a href="https://twitter.com/URLFESTIVAL" target="_blank" rel="noopener">
        <img id="heart" src="images/heart-white.svg" alt="heart" />
      </a>
    `;
  }
}

window.customElements.define('festival-ui-ended', FestivalUiEnded);
