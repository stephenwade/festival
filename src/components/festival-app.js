import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';
import { connect } from 'pwa-helpers/connect-mixin.js';

import { store } from '../store.js';
import { loadSets } from '../actions/loadSets.js';
import './festival-coordinator.js';
import './festival-audio.js';
import './festival-ui.js';

export class FestivalApp extends connect(store)(PolymerElement) {
  static get template() {
    return html`
      <festival-coordinator id="coordinator"></festival-coordinator>
      <festival-audio
        id="audio"
        audio-status="{{audioStatus}}"
        on-error="_handleAudioError"
        on-loadedmetadata="_handleAudioLoadedMetadata"
        on-visualizer-data-available="_handleAudioVisualizerDataAvailable"
      ></festival-audio>
      <festival-ui
        id="ui"
        audio-status="[[audioStatus]]"
        on-listen="_handleListenClicked"
      ></festival-ui>
    `;
  }

  static get properties() {
    return {
      getAudioVisualizerData: Function,
      showStatus: Object,
      audioStatus: Object,
    };
  }

  ready() {
    super.ready();

    store.dispatch(loadSets());
  }

  _handleListenClicked() {
    this.$.audio.initialize();
  }

  _handleAudioError() {
    this.$.ui.showAudioError();
  }

  _handleAudioLoadedMetadata(e) {
    this.$.coordinator.updateSetMetadata(e.detail);
  }

  _handleAudioVisualizerDataAvailable(e) {
    this.$.ui.getAudioVisualizerData = e.detail.getAudioVisualizerData;
  }
}

window.customElements.define('festival-app', FestivalApp);
