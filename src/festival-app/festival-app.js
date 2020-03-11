import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';
import '../festival-ui/festival-ui.js';
import '../festival-load-sets/festival-load-sets.js';
import '../festival-coordinator/festival-coordinator.js';
import '../festival-audio/festival-audio.js';

export class FestivalApp extends PolymerElement {
  static get template() {
    return html`
      <festival-ui
        audio-status="[[audioStatus]]"
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
        get-audio-visualizer-data="{{getAudioVisualizerData}}"
        audio-status="{{audioStatus}}"
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
      audioStatus: Object
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
}

window.customElements.define('festival-app', FestivalApp);
