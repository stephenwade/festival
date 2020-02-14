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

  constructor() {
    super();

    this.state = {};
  }

  action(e) {} // eslint-disable-line no-unused-vars, no-empty-function
}

window.customElements.define('festival-controller', FestivalController);
