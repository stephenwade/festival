import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';
import '@polymer/polymer/lib/elements/dom-if.js';
import './ui-intro.js';
import './ui-waiting.js';

export class FestivalUi extends PolymerElement {
  static get template() {
    return html`
      <style>
        :host {
          box-sizing: border-box;
        }
        *,
        *:before,
        *:after {
          box-sizing: inherit;
        }

        :host {
          position: absolute;
          width: 100%;
          height: 100%;
          color: white;
          font-family: 'HelveticaNeue-Light', 'Helvetica Neue Light',
            'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif;
          background: var(--gradient-background);
        }

        pre {
          margin: 0;
          position: absolute;
          bottom: 0.5em;
          left: 0.5em;
        }
      </style>
      <pre>{{_stateDescription}}</pre>
      <template is="dom-if" if="[[_waitingForAudioContext]]">
        <ui-intro></ui-intro>
      </template>
      <template is="dom-if" if="[[_waitingUntilStart]]">
        <ui-waiting
          set="[[audioStatus.set]]"
          seconds-until-set="[[audioStatus.secondsUntilSet]]"
        ></ui-waiting>
      </template>
    `;
  }

  static get properties() {
    return {
      audioStatus: Object,
      getAudioVisualizerData: Function,
      _stateDescription: {
        type: String,
        computed: '_computeStateDescription(audioStatus.*)'
      },
      _waitingForAudioContext: {
        type: Boolean,
        computed: '_computeWaitingForAudioContext(audioStatus.status)'
      },
      _waitingUntilStart: {
        type: Boolean,
        computed: '_computeWaitingUntilStart(audioStatus.status)'
      }
    };
  }

  _computeStateDescription() {
    return JSON.stringify(this.audioStatus, undefined, 2);
  }

  _computeWaitingForAudioContext(status) {
    return status && status === 'WAITING_FOR_AUDIO_CONTEXT';
  }

  _computeWaitingUntilStart(status) {
    return status && status === 'WAITING_UNTIL_START';
  }
}

window.customElements.define('festival-ui', FestivalUi);
