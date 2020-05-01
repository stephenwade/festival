import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';
import '../festival-ui/festival-ui.js';
import '../festival-load-sets/festival-load-sets.js';
import '../festival-coordinator/festival-coordinator.js';
import '../festival-audio/festival-audio.js';

export class FestivalApp extends PolymerElement {
  static get template() {
    return html`
      <festival-ui
        id="ui"
        audio-status="[[audioStatus]]"
        audio-waiting="[[audioWaiting]]"
        audio-stalled="[[audioStalled]]"
        get-audio-visualizer-data="[[getAudioVisualizerData]]"
        on-listen="_handleListenClicked"
      ></festival-ui>
      <festival-load-sets
        id="loader"
        sets-data="{{setsData}}"
      ></festival-load-sets>
      <festival-coordinator
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
        get-audio-visualizer-data="{{getAudioVisualizerData}}"
        on-error="_handleAudioError"
      ></festival-audio>
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
    };
  }

  ready() {
    super.ready();

    this._loadData();
  }

  _loadData() {
    this.$.loader.loadData();
  }

  _handleListenClicked() {
    this.$.audio.initialize();
  }

  _handleAudioError() {
    this.$.ui.showError();
  }
}

window.customElements.define('festival-app', FestivalApp);
