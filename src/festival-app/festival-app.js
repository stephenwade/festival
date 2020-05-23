import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';
import '../festival-load-sets/festival-load-sets.js';
import '../festival-coordinator/festival-coordinator.js';
import '../festival-audio/festival-audio.js';
import '../festival-ui/festival-ui.js';

export class FestivalApp extends PolymerElement {
  static get template() {
    return html`
      <festival-load-sets id="loader"></festival-load-sets>
      <festival-coordinator
        id="coordinator"
        sets-data="[[setsData]]"
        target-show-status="{{targetShowStatus}}"
        target-audio-status="{{targetAudioStatus}}"
      ></festival-coordinator>
      <festival-audio
        id="audio"
        target-show-status="[[targetShowStatus]]"
        target-audio-status="[[targetAudioStatus]]"
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
      setsData: Object,
      targetShowStatus: String,
      targetAudioStatus: Object,
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

    this._loadData();
  }

  async _loadData() {
    try {
      this.setsData = await this.$.loader.loadData();
    } catch (e) {
      this.$.ui.showLoadingError();
    }
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
