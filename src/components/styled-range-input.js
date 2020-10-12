import { LitElement, html, css } from 'lit-element';

export class StyledRangeInput extends LitElement {
  static get styles() {
    return [
      css`
        input[type='range'] {
          position: relative;
          top: 1px;
        }
      `,
      // http://danielstern.ca/range.css/
      css`
        /* stylelint-disable */
        input[type='range'] {
          width: 100%;
          margin: 7px 0;
          background-color: transparent;
          -webkit-appearance: none;
        }
        input[type='range']:focus {
          outline: none;
        }
        input[type='range']::-webkit-slider-runnable-track {
          background: #c2c2c2;
          border: 0;
          border-radius: 2px;
          width: 100%;
          height: 2px;
          cursor: pointer;
        }
        input[type='range']::-webkit-slider-thumb {
          margin-top: -7px;
          width: 16px;
          height: 16px;
          background: #050595;
          border: 0;
          border-radius: 8px;
          cursor: pointer;
          -webkit-appearance: none;
        }
        input[type='range']:focus::-webkit-slider-runnable-track {
          background: #c2c2c2;
        }
        input[type='range']::-moz-range-track {
          background: #c2c2c2;
          border: 0;
          border-radius: 2px;
          width: 100%;
          height: 2px;
          cursor: pointer;
        }
        input[type='range']::-moz-range-thumb {
          width: 16px;
          height: 16px;
          background: #050595;
          border: 0;
          border-radius: 8px;
          cursor: pointer;
        }
        input[type='range']::-ms-track {
          background: transparent;
          border-color: transparent;
          border-width: 7px 0;
          color: transparent;
          width: 100%;
          height: 2px;
          cursor: pointer;
        }
        input[type='range']::-ms-fill-lower {
          background: #c2c2c2;
          border: 0;
          border-radius: 4px;
        }
        input[type='range']::-ms-fill-upper {
          background: #c2c2c2;
          border: 0;
          border-radius: 4px;
        }
        input[type='range']::-ms-thumb {
          width: 16px;
          height: 16px;
          background: #050595;
          border: 0;
          border-radius: 8px;
          cursor: pointer;
          margin-top: 0px;
          /*Needed to keep the Edge thumb centred*/
        }
        input[type='range']:focus::-ms-fill-lower {
          background: #c2c2c2;
        }
        input[type='range']:focus::-ms-fill-upper {
          background: #c2c2c2;
        }
        /*TODO: Use one of the selectors from https://stackoverflow.com/a/20541859/7077589 and figure out
how to remove the virtical space around the range input in IE*/
        @supports (-ms-ime-align: auto) {
          /* Pre-Chromium Edge only styles, selector taken from hhttps://stackoverflow.com/a/32202953/7077589 */
          input[type='range'] {
            margin: 0;
            /*Edge starts the margin from the thumb, not the track as other browsers do*/
          }
        }
      `,
    ];
  }

  render() {
    return html`<input
      type="range"
      min=${this.min}
      max=${this.max}
      step=${this.step}
      .value=${this.value}
      tabindex=${this.getTabIndex()}
      @input=${this._handleInput}
    />`;
  }

  static get properties() {
    return {
      disabled: { type: Boolean },
      min: { type: Number },
      max: { type: Number },
      step: { type: Number },
      value: { type: Number, reflect: true },
    };
  }

  set value(value) {
    const oldValue = this._value;

    const num = Number(value);
    if (num > this.max) this._value = this.max;
    else if (num < this.min) this._value = this.min;
    else this._value = num;

    this.requestUpdate('value', oldValue);
  }

  get value() {
    return this._value;
  }

  constructor() {
    super();

    // default value if attribute is not set
    this.step = 1;
  }

  firstUpdated() {
    this._handleInput();
  }

  getTabIndex() {
    if (this.disabled) return -1;
    return 0;
  }

  _handleInput() {
    const input = this.shadowRoot.querySelector('input');
    this.value = input.value;
  }
}

window.customElements.define('styled-range-input', StyledRangeInput);
