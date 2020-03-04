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
        pre {
          margin: 0;
        }
      </style>
      <pre>{{_stateDescription}}</pre>
    `;
  }

  static get properties() {
    return {
      setsData: Object,
      targetShowStatus: String,
      targetAudioStatus: Object,
      _stateDescription: {
        type: String,
        computed:
          '_computeStateDescription(setsData, targetShowStatus, targetAudioStatus, audioContextReady, audioStatus)'
      }
    };
  }

  _computeStateDescription(
    setsData,
    targetShowStatus,
    targetAudioStatus,
    audioContextReady,
    audioStatus
  ) {
    const state = {
      setsData,
      targetShowStatus,
      targetAudioStatus,
      audioContextReady,
      audioStatus
    };
    return JSON.stringify(state, undefined, 2);
  }
}

window.customElements.define('festival-ui', FestivalUi);
