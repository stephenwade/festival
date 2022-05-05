import { html, LitElement } from 'lit';

class AdminLogin extends LitElement {
  render() {
    return html`
      <p>Not logged in.</p>
      <form @submit="${this._login}">
        <p><input id="email" type="email" /></p>
        <p><input type="submit" value="Login" /></p>
      </form>
    `;
  }

  _login(e) {
    e.preventDefault();

    const email = this.shadowRoot.getElementById('email').value;

    this.dispatchEvent(
      new CustomEvent('login', {
        bubbles: true,
        composed: true,
        detail: { email },
      })
    );
  }
}

customElements.define('f-login', AdminLogin);
