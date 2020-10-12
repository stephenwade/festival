import { LitElement, html, css } from 'lit-element';

import './styled-range-input.js';
import { boxSizingBorderBox, buttonReset } from './shared-styles.js';
import { svgVolumeMute, svgVolumeDown, svgVolumeUp } from './icons.js';

export class FabVolumeButton extends LitElement {
  static get styles() {
    return [
      boxSizingBorderBox,
      buttonReset,
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
        button:focus::after {
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
          clip-path: inset(0 0 0 calc(100% - 30px));
        }
        :host([opened]) #slider-container {
          left: calc(100% - 30px);
          transition-duration: 200ms;
          clip-path: inset(0 0 0 0);
        }
      `,
    ];
  }

  render() {
    return html`
      <button @click=${this._toggleOpen} @keydown=${this._handleKeyDown}>
        ${this._getVolumeIcon()}
      </button>
      <div id="slider-container">
        <styled-range-input
          min="0"
          max="100"
          .value=${this.volume}
          step="5"
          ?disabled=${!this.opened}
          @input=${this._handleInput}
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

  _toggleOpen() {
    this.opened = !this.opened;
  }

  _getVolumeIcon() {
    if (this.volume === 0) return svgVolumeMute;
    if (this.volume < 50) return svgVolumeDown;
    return svgVolumeUp;
  }

  _handleKeyDown(e) {
    const input = this.shadowRoot.querySelector('styled-range-input');
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

      // no default
    }

    this.volume = input.value;
  }

  _handleInput() {
    const input = this.shadowRoot.querySelector('styled-range-input');
    this.volume = input.value;

    this.dispatchEvent(
      new CustomEvent('volumechange', {
        bubbles: true,
        composed: true,
        detail: {
          volume: this.volume,
        },
      })
    );
  }
}

window.customElements.define('fab-volume-button', FabVolumeButton);
