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
          '_computeStateDescription(setsData, targetShowStatus, audioContextReady, targetAudioStatus.*, audioStatus.*)'
      }
    };
  }

  _computeStateDescription(setsData, targetShowStatus, audioContextReady) {
    const state = {
      setsData,
      targetShowStatus,
      targetAudioStatus: this.targetAudioStatus,
      audioContextReady,
      audioStatus: this.audioStatus
    };
    return JSON.stringify(state, undefined, 2);
  }
}

window.customElements.define('festival-ui', FestivalUi);
