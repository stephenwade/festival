import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';
import '../festival-ui/festival-ui.js';

export class FestivalApp extends PolymerElement {
  static get template() {
    return html`
      <festival-ui
        id="ui"
        state="[[state]]"
        on-action="_handleAction"
      ></festival-ui>
    `;
  }

  static get properties() {
    return {
      state: Object
    };
  }

  connectedCallback() {
    super.connectedCallback();

    this._handleAction({ detail: { action: 'INIT' } });
  }

  _handleAction(e) {
    const detail = e.detail;

    switch (detail.action) {
      case 'INIT':
        this._initializeState();
        break;

      default:
        throw new Error('Unknown action');
    }
  }

  _initializeState() {
    this.state = {
      dataLoaded: false,
      data: {}
    };
  }
}

window.customElements.define('festival-app', FestivalApp);
