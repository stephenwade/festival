import { LitElement, html } from 'lit-element';
import { connect } from 'pwa-helpers/connect-mixin.js';

import { store } from '../store.js';
import { loadSets, updateSetMetadata } from '../actions/setsData.js';
import './festival-clock.js';
import './festival-audio.js';
import './festival-ui.js';

class FestivalApp extends connect(store)(LitElement) {
  render() {
    return html`
      <festival-clock></festival-clock>
      <festival-audio
        id="audio"
        @error="${this._handleAudioError}"
        @loadedmetadata="${FestivalApp._handleAudioLoadedMetadata}"
        @visualizer-data-available="${this._handleAudioVisualizerDataAvailable}"
      ></festival-audio>
      <festival-ui id="ui" @listen="${this._handleListenClicked}"></festival-ui>
    `;
  }

  static get properties() {
    return {
      getAudioVisualizerData: { attribute: false },
    };
  }

  connectedCallback() {
    super.connectedCallback();

    store.dispatch(loadSets());

    const minMs = 60 * 1000;
    this._loadSetsInterval = window.setInterval(() => {
      store.dispatch(loadSets({ ignoreErrors: true }));
    }, 1 * minMs);
  }

  disconnectedCallback() {
    window.clearInterval(this._loadSetsInterval);

    super.disconnectedCallback();
  }

  _handleListenClicked() {
    const audio = this.shadowRoot.getElementById('audio');
    audio.init();
  }

  _handleAudioError() {
    const ui = this.shadowRoot.getElementById('ui');
    ui.showAudioError();
  }

  static _handleAudioLoadedMetadata(e) {
    store.dispatch(updateSetMetadata(e.detail));
  }

  _handleAudioVisualizerDataAvailable(e) {
    const ui = this.shadowRoot.getElementById('ui');
    ui.getAudioVisualizerData = e.detail.getAudioVisualizerData;
  }
}

window.customElements.define('festival-app', FestivalApp);
