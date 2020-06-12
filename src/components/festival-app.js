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
        audio-context-ready="{{audioContextReady}}"
        audio-status="{{audioStatus}}"
        audio-waiting="{{audioWaiting}}"
        audio-stalled="{{audioStalled}}"
        audio-paused="{{audioPaused}}"
        get-audio-visualizer-data="{{getAudioVisualizerData}}"
        on-error="_handleAudioError"
        on-loadedmetadata="_handleAudioLoadedMetadata"
      ></festival-audio>
      <festival-ui
        id="ui"
        audio-status="[[audioStatus]]"
        audio-waiting="[[audioWaiting]]"
        audio-stalled="[[audioStalled]]"
        audio-paused="[[audioPaused]]"
        get-audio-visualizer-data="[[getAudioVisualizerData]]"
        on-listen="_handleListenClicked"
      ></festival-ui>
    `;
  }

  static get properties() {
    return {
      audioContextReady: Boolean,
      getAudioVisualizerData: Function,
      audioStatus: Object,
      audioWaiting: Boolean,
      audioStalled: Boolean,
      audioPaused: Boolean,
    };
  }

  ready() {
    super.ready();

    store.dispatch(loadSets());
  }

  stateChanged(state) {
    if (state.ui.errorLoading) this.$.ui.showLoadingError();
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
}

window.customElements.define('festival-app', FestivalApp);
