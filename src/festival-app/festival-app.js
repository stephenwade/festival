import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';
import '@polymer/polymer/lib/elements/dom-if.js';
import '../join-button/join-button.js';

/**
 * @customElement
 * @polymer
 */
export class FestivalApp extends PolymerElement {
  static get template() {
    return html`
      <style>
        :host {
          position: absolute;
          width: 100%;
          height: 100%;
          background-color: #223;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      </style>
      <template is="dom-if" if="{{!joined}}">
        <join-button on-click="joinClicked"></join-button>
      </template>
      <template is="dom-if" if="{{joined}}">
        <span style="color: white; font-size: 60px">Joining…</span>
      </template>
    `;
  }
  static get properties() {
    return {
      joined: {
        type: Boolean,
        value: false
      }
    };
  }
  joinClicked() {
    this.joined = true;
  }
}

window.customElements.define('festival-app', FestivalApp);
