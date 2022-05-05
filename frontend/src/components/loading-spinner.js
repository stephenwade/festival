// Based on a loading spinner licensed under CC0
// found at https://loading.io/css/

import { css, html, LitElement } from 'lit';

class LoadingSpinner extends LitElement {
  static get styles() {
    return css`
      :host {
        display: inline-block;
        width: 80px;
        height: 80px;
      }

      #spinner {
        width: 64px;
        height: 64px;
        margin: 8px;
        border-width: 6px;
        border-style: solid;
        border-color: #fff transparent;
        border-radius: 50%;
        animation: spinner 1.2s linear infinite;
      }

      @keyframes spinner {
        0% {
          transform: rotate(0deg);
        }

        100% {
          transform: rotate(360deg);
        }
      }
    `;
  }

  render() {
    return html`<div id="spinner"></div>`;
  }
}

customElements.define('loading-spinner', LoadingSpinner);
