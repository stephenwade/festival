import { LitElement, html, css } from 'lit-element';

class StyledRangeInput extends LitElement {
  static get styles() {
    // Styles are based on Daniel Stern's range.css
    // http://danielstern.ca/range.css/
    return css`
      input[type='range'] {
        --sri-color-primary: var(--range-color-primary, #050595);
        --sri-color-secondary: var(--range-color-secondary, #8383fb);

        position: relative;
        top: 1px;
        width: 100%;
        margin: 7px 0;
        background-color: transparent;
        -webkit-appearance: none;
      }

      input[type='range']:focus {
        outline: none;
      }

      input[type='range']::-webkit-slider-runnable-track {
        width: 100%;
        height: 2px;
        border: 0;
        border-radius: 2px;
        background: var(--sri-color-secondary);
        cursor: pointer;
      }

      input[type='range']::-webkit-slider-thumb {
        width: 16px;
        height: 16px;
        margin-top: -7px;
        border: 0;
        border-radius: 8px;
        background: var(--sri-color-primary);
        cursor: pointer;
        -webkit-appearance: none;
      }

      input[type='range']:focus::-webkit-slider-runnable-track {
        background: var(--sri-color-secondary);
      }

      input[type='range']::-moz-range-track {
        width: 100%;
        height: 2px;
        border: 0;
        border-radius: 2px;
        background: var(--sri-color-secondary);
        cursor: pointer;
      }

      input[type='range']::-moz-range-thumb {
        width: 16px;
        height: 16px;
        border: 0;
        border-radius: 8px;
        background: var(--sri-color-primary);
        cursor: pointer;
      }
    `;
  }

  render() {
    return html`<input
      type="range"
      min=${this.min}
      max=${this.max}
      step=${this.step}
      .value=${this.value}
      tabindex=${this._getTabIndex()}
      @input=${this._handleInput}
      @change=${this._handleChange}
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

  _getTabIndex() {
    if (this.disabled) return -1;
    return 0;
  }

  _handleInput(e) {
    this.value = e.target.value;

    e.stopPropagation();

    this.dispatchEvent(
      new CustomEvent('input', {
        bubbles: true,
        composed: true,
      })
    );
  }

  _handleChange(e) {
    this.value = e.target.value;

    e.stopPropagation();

    this.dispatchEvent(
      new CustomEvent('change', {
        bubbles: true,
        composed: true,
      })
    );
  }
}

window.customElements.define('styled-range-input', StyledRangeInput);
