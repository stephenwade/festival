import './components/f-admin-ui.js';
import './components/f-loading.js';
import './components/f-login.js';

import { html, LitElement } from 'lit';

import { magic } from './magic.js';

class FestivalAdmin extends LitElement {
  render() {
    if (this.magicReady) {
      if (this.userInfo) {
        return html`<f-admin-ui
          .userInfo="${this.userInfo}"
          @logout="${this.logout}"
        ></f-admin-ui>`;
      }
      return html`<f-login @login="${this.login}"></f-login>`;
    }
    return html`<f-loading></f-loading>`;
  }

  static get properties() {
    return {
      magicReady: { type: Boolean },
      userInfo: { type: Object },
    };
  }

  constructor() {
    super();

    this.checkLoggedIn();
  }

  async checkLoggedIn() {
    const isLoggedIn = await magic.user.isLoggedIn();

    if (isLoggedIn) {
      this.userInfo = await magic.user.getMetadata();
    }

    this.magicReady = true;
  }

  async login(e) {
    const { email } = e.detail;

    await magic.auth.loginWithMagicLink({ email });

    this.checkLoggedIn();
  }

  async logout() {
    this.magicReady = false;

    await magic.user.logout();
    this.userInfo = undefined;

    this.magicReady = true;
  }
}

customElements.define('festival-admin', FestivalAdmin);
