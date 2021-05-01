import { LitElement, html } from 'lit';

class LoadingSpinner extends LitElement {
  render() {
    return html`<p>Loading…</p>`;
  }
}

customElements.define('f-loading', LoadingSpinner);
