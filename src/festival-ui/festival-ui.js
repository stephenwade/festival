import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';
import { ActionMixin } from '../../lib/mixins/action-mixin.js';

export class FestivalUi extends ActionMixin(PolymerElement) {
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
        pre {
          margin: 0;
        }
      </style>
      <pre>{{_stateDescription}}</pre>
    `;
  }

  static get properties() {
    return {
      state: Object,
      _stateDescription: {
        type: String,
        computed:
          '_computeStateDescription(state, state.setsLoaded, state.setsData, state.audioContextReady, state.audioVisualizerData, state.targetShowStatus, state.targetCurrentSet)'
      }
    };
  }

  connectedCallback() {
    super.connectedCallback();

    this.addEventListener('click', () => {
      this.fireAction('SETUP_AUDIO_CONTEXT');
    });
  }

  _computeStateDescription(state) {
    const displayState = { ...state };
    if (
      displayState.audioVisualizerData &&
      displayState.audioVisualizerData.constructor === Uint8Array
    )
      displayState.audioVisualizerData = `Uint8Array[${displayState.audioVisualizerData.length}]`;
    return JSON.stringify(displayState, undefined, 2);
  }
}

window.customElements.define('festival-ui', FestivalUi);
