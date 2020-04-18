import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';
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
          color: black;
          width: 100%;
          height: 100%;
          overflow: hidden;
          text-align: center;
        }

        #left {
          position: absolute;
          top: 50%;
          -webkit-transform: translateY(-50%);
          transform: translateY(-50%);
          padding: 0 1em;
          width: calc(min(80vw, 800px));
        }

        #right {
          position: absolute;
          height: 100vh;
          right: 0;
          width: calc(max(20vw, 100vw - 800px));
        }

        #right iron-image {
          width: 100%;
          height: 100%;
        }

        #logo {
          display: block;
          width: 100%;
          max-width: 650px;
          margin: 2em auto;
        }

        #buttons {
          width: 100%;
          font-size: 2em;
          /* background: var(--gradient-background); */
          background-size: 100% auto;
          margin-bottom: 0.5em;
        }

        paper-button {
          background: var(--accent-color);
          color: black;
          font-weight: bold;
          border-radius: 5px;
          padding: 0.5em 1em;
          margin-bottom: 0.5em;
          /* transform: skew(-10deg); */

          /* gradient cutout */
          /*
          color: black;
          --paper-button-ink-color: black;
          mix-blend-mode: screen;
          */
        }

        a {
          text-decoration: none;
          -webkit-tap-highlight-color: transparent;
        }
      </style>
      <div id="left">
        <a href="https://twitter.com/URLFESTIVAL">
          <iron-image
            id="logo"
            src="images/dnb-break-66-logo.svg"
            preload
            loaded="{{_logoLoaded}}"
          ></iron-image
        ></a>
        <div id="buttons" hidden$="[[!_imagesLoaded]]">
          <paper-button id="button-listen" on-click="_handleListenClicked">
            Listen&nbsp;Live
          </paper-button>
          <a href="https://discord.io/festival" target="_blank" tabindex="-1">
            <paper-button id="button-discord">Join&nbsp;Discord</paper-button>
          </a>
        </div>
      </div>
      <div id="right" hidden$="[[!_imagesLoaded]]">
        <iron-image
          id="lines"
          src="images/dnb-break-66-lines.svg"
          sizing="cover"
          position="0 0"
          preload
          loaded="{{_linesLoaded}}"
        ></iron-image>
      </div>
    `;
  }

  static get properties() {
    return {
      _logoLoaded: Boolean,
      _linesLoaded: Boolean,
      _imagesLoaded: {
        type: Boolean,
        computed: '_computeImagesLoaded(_logoLoaded, _linesLoaded)'
      }
    };
  }

  _computeImagesLoaded(_logoLoaded, _linesLoaded) {
    return _logoLoaded && _linesLoaded;
  }

  _handleListenClicked() {
    this.dispatchEvent(
      new CustomEvent('listen', { bubbles: true, composed: true })
    );
  }
}

window.customElements.define('ui-intro', UiIntro);
