import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';

export class FestivalUi extends PolymerElement {
  static get template() {
    return html`
      <style>
        :host {
          position: absolute;
          width: 100%;
          height: 100%;
          color: white;
          margin: 0.5em;
        }
      </style>
      {{_stateDescription}}
    `;
  }

  static get properties() {
    return {
      state: Object,
      _stateDescription: {
        type: String,
        computed:
          '_computeStateDescription(state, state.setsLoaded, state.setsData)'
      }
    };
  }

  _computeStateDescription(state) {
    return JSON.stringify(state);
  }
}

window.customElements.define('festival-ui', FestivalUi);
