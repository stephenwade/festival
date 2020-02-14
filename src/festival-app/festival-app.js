import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';
import '../festival-controller/festival-controller.js';
import '../festival-ui/festival-ui.js';

export class FestivalApp extends PolymerElement {
  static get template() {
    return html`
      <festival-controller
        id="controller"
        state="{{state}}"
      ></festival-controller>
      <festival-ui
        id="ui"
        state="[[state]]"
        on-action="handleAction"
      ></festival-ui>
    `;
  }

  static get properties() {
    return {
      state: Object
    };
  }

  handleAction(e) {
    this.$.controller.action(e.detail);
  }
}

window.customElements.define('festival-app', FestivalApp);
