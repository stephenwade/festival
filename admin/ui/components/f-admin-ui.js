import { LitElement, html } from 'lit';
import { until } from 'lit/directives/until.js';

import { fetchWithMagic } from '../magic.js';

const fetchData = async () => {
  const response = await fetchWithMagic('/api/test', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (response.ok) {
    return response.text();
  }
  throw new Error('Error loading');
};

class AdminUi extends LitElement {
  render() {
    return html`
      <p>Logged in as ${this.userInfo.email}.</p>
      <p>${until(this.content, 'Admin loading…')}</p>
      <p>
        <button @click="${this._logout}">Logout</button>
      </p>
    `;
  }

  static get properties() {
    return {
      userInfo: { type: Object },
    };
  }

  connectedCallback() {
    super.connectedCallback();

    this.content = fetchData();
  }

  _logout() {
    this.dispatchEvent(
      new CustomEvent('logout', {
        bubbles: true,
        composed: true,
      })
    );
  }
}

customElements.define('f-admin-ui', AdminUi);
