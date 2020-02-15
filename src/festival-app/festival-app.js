import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';
import { ActionMixin } from '../../lib/mixins/action-mixin.js';
import '../festival-ui/festival-ui.js';
import '../festival-data/festival-data.js';

export class FestivalApp extends ActionMixin(PolymerElement) {
  static get template() {
    return html`
      <festival-ui id="ui" state="[[state]]"></festival-ui>
      <festival-data id="data"></festival-data>
    `;
  }

  static get properties() {
    return {
      state: Object
    };
  }

  connectedCallback() {
    super.connectedCallback();

    this.addEventListener('action', this._handleAction);

    this.fireAction('INIT');
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    this.removeEventListener('action', this._handleAction);
  }

  _handleAction(e) {
    const action = e.detail.action;
    const detail = e.detail;

    switch (action) {
      case 'INIT':
        this._initializeState();
        this._loadData();
        break;

      case 'LOADED_DATA':
        this.set('state.data', detail.data);
        this.set('state.dataLoaded', true);
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

  _loadData() {
    this.$.data.loadData();
  }
}

window.customElements.define('festival-app', FestivalApp);
