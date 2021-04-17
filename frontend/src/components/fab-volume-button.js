import { LitElement, html, css } from 'lit-element';

import './styled-range-input.js';
import { boxSizingBorderBox, buttonReset } from './shared-styles.js';
import {
  elevationTransition,
  elevationZ0,
  elevationZ6,
  elevationZ12,
  elevationZ12Rotated90,
} from './shared-styles-elevation.js';
import { svgVolumeMute, svgVolumeDown, svgVolumeUp } from './icons.js';

class FabVolumeButton extends LitElement {
  static get styles() {
    return [
      boxSizingBorderBox,
      buttonReset,
      elevationTransition,
      elevationZ0,
      elevationZ6,
      elevationZ12,
      elevationZ12Rotated90,
      css`
        :host {
          transform: rotate(-90deg);
        }

        button {
          position: relative;
          z-index: 1;
          width: 56px;
          height: 56px;
          border-radius: 28px;
          background-color: white;
          outline: none;
          transform: rotate(90deg);
        }
        button:active::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          display: block;
          width: 56px;
          height: 56px;
          border-radius: 28px;
          background-color: var(--background-color);
          opacity: 0.2;
        }

        svg {
          vertical-align: middle;
          width: 24px;
          height: 24px;
          fill: var(--background-color);
        }

        #slider-container {
          position: absolute;
          top: 50%;
          left: calc(56px - 12em);
          width: 12em;
          height: 30px;
          padding-right: 15px;
          padding-left: 45px;
          border-radius: 15px;
          background-color: white;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
          transition-duration: 150ms;
          transition-property: left, clip-path;
          transform: translateY(-50%);
          clip-path: inset(-24px -24px -24px calc(100% - 30px));
        }
        :host([opened]) #slider-container {
          left: calc(100% - 30px);
          transition-duration: 200ms;
          clip-path: inset(-24px);
        }

        styled-range-input {
          --range-color-primary: var(--background-color);
          --range-color-secondary: var(--background-color-lighter);
        }
      `,
    ];
  }

  render() {
    return html`
      <button
        class="mdc-elevation-transition
          ${this.opened ? 'mdc-elevation--z12' : 'mdc-elevation--z6'}"
        aria-label="Volume"
        @click=${this._toggleOpen}
        @keydown=${this._handleKeyDown}
      >
        ${this._getVolumeIcon()}
      </button>
      <div
        id="slider-container"
        class="mdc-elevation-transition
          ${this.opened ? 'mdc-elevation--z12--r90' : 'mdc-elevation--z0'}"
      >
        <styled-range-input
          id="input"
          min="0"
          max="100"
          .value=${this.volume}
          step="5"
          aria-label="Volume"
          ?disabled=${!this.opened}
          @input=${this._handleInput}
          @change=${this._handleChange}
        ></styled-range-input>
      </div>
    `;
  }

  static get properties() {
    return {
      opened: { type: Boolean, reflect: true },
      volume: { type: Number, reflect: true },
    };
  }

  open() {
    this.opened = true;
  }

  close() {
    this.opened = false;
  }

  constructor() {
    super();

    this._handleKeyDown = this._handleKeyDown.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();

    document.addEventListener('keydown', this._handleKeyDown);
  }

  disconnectedCallback() {
    document.removeEventListener('keydown', this._handleKeyDown);

    super.disconnectedCallback();
  }

  _toggleOpen() {
    this.opened = !this.opened;
  }

  _getVolumeIcon() {
    if (this.volume === 0) return svgVolumeMute;
    if (this.volume < 50) return svgVolumeDown;
    return svgVolumeUp;
  }

  _handleKeyDown(e) {
    const input = this.shadowRoot.getElementById('input');
    const { step, min, max } = input;

    switch (e.key) {
      case 'ArrowLeft':
      case 'ArrowDown':
        input.value -= step;
        break;

      case 'ArrowRight':
      case 'ArrowUp':
        input.value += step;
        break;

      case 'PageUp':
        input.value += 10;
        break;

      case 'PageDown':
        input.value -= 10;
        break;

      case 'Home':
        input.value = min;
        break;

      case 'End':
        input.value = max;
        break;

      default:
        return;
    }

    this.volume = input.value;

    this._dispatchVolumeEvent('volumeinput');
    this._dispatchVolumeEvent('volumechange');
  }

  _handleInput(e) {
    e.stopPropagation();

    const volume = e.target.value;
    this.volume = volume;

    this._dispatchVolumeEvent('volumeinput');
  }

  _handleChange(e) {
    e.stopPropagation();

    const volume = e.target.value;
    this.volume = volume;

    this._dispatchVolumeEvent('volumechange');
  }

  _dispatchVolumeEvent(eventName) {
    this.dispatchEvent(
      new CustomEvent(eventName, {
        bubbles: true,
        composed: true,
        detail: {
          volume: this.volume,
        },
      })
    );
  }
}

customElements.define('fab-volume-button', FabVolumeButton);
