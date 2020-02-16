import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';
import { ActionMixin } from '../../lib/mixins/action-mixin.js';
import '../festival-ui/festival-ui.js';
import '../festival-data/festival-data.js';
import '../festival-audio/festival-audio.js';

export class FestivalApp extends ActionMixin(PolymerElement) {
  static get template() {
    return html`
      <festival-ui id="ui" state="[[state]]"></festival-ui>
      <festival-data id="data"></festival-data>
      <festival-audio id="audio"></festival-audio>
    `;
  }

  static get properties() {
    return {
      state: Object
    };
  }

  connectedCallback() {
    super.connectedCallback();

    this.addEventListener('action', this._handleAction);

    this.fireAction('INIT');
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    this.removeEventListener('action', this._handleAction);
  }

  _handleAction(e) {
    const action = e.detail.action;
    const detail = e.detail;

    switch (action) {
      case 'INIT':
        this._initializeState();
        this._loadData();
        break;

      case 'SETS_LOADED':
        this.set('state.setsData', detail.data);
        this.set('state.setsLoaded', true);
        break;

      case 'SETUP_AUDIO_CONTEXT':
        this._setupAudioContext();
        break;

      case 'AUDIO_CONTEXT_READY':
        this.set('state.audioContextReady', true);
        this.set('state.audioData', detail.audioData);
        break;

      default:
        throw new Error('Unknown action');
    }
  }

  _initializeState() {
    this.state = {
      setsLoaded: false,
      audioContextReady: false
    };
  }

  _loadData() {
    this.$.data.loadData();
  }

  _setupAudioContext() {
    this.$.audio.setupAudioContext();
  }
}

window.customElements.define('festival-app', FestivalApp);
