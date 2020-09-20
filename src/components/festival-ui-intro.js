import { LitElement, html, css } from 'lit-element';

export class FestivalUiIntro extends LitElement {
  static get styles() {
    return css`
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

      #buttons a {
        text-decoration: none;
        text-transform: uppercase;
        display: inline-block;
        background: white;
        font-weight: bold;
        border-radius: 5px;
        padding: 0.5em 1em;
        margin: 0 0.2em 0.5em 0.2em;
        transform: skew(-10deg);

        /* gradient cutout */
        color: black;
        mix-blend-mode: screen;
      }
    `;
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
          src="images/festiv4l-logo.svg"
          alt="FESTIV4L"
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
