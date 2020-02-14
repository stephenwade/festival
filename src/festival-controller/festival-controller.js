import { PolymerElement } from '@polymer/polymer/polymer-element.js';

export class FestivalController extends PolymerElement {
  static get template() {
    return null;
  }

  static get properties() {
    return {
      state: {
        type: Object,
        notify: true
      }
    };
  }

  connectedCallback() {
    super.connectedCallback();

    this.action({ action: 'INIT' });
  }

  action(detail) {
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

window.customElements.define('festival-controller', FestivalController);
