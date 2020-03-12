import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';
import '@polymer/polymer/lib/elements/dom-repeat.js';

export class UiWaiting extends PolymerElement {
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
          color: white;
          width: 100%;
          position: absolute;
          top: 50%;
          left: 50%;
          -webkit-transform: translateX(-50%) translateY(-50%);
          transform: translateX(-50%) translateY(-50%);
          text-align: center;
          padding: 0 1em;
          text-transform: uppercase;
        }

        #countdown {
          font-size: 5em;
          font-weight: 900;
          margin-bottom: 0.2em;
        }

        #nextup {
          font-size: 2em;
          margin-bottom: 0.2em;
        }

        #artist,
        #members {
          display: inline-block;
          line-height: 1;
          vertical-align: top;
        }

        #artist {
          font-size: 3em;
          font-weight: 900;
          text-align: right;
          padding-right: 0.3rem;
          letter-spacing: -0.05em;
        }

        #members {
          font-size: 1.3em;
          text-align: left;
          padding-left: 0.3rem;
          padding-top: 0.2em;
        }

        #members span {
          display: block;
        }
      </style>
      <div id="countdown">[[_countdownText]]</div>
      <div id="nextup">Next up</div>
      <div id="artist">[[set.artist]]</div>
      <div id="members">
        <dom-repeat items="[[set.members]]">
          <template>
            <span>[[item]]</span>
          </template>
        </dom-repeat>
      </div>
    `;
  }

  static get properties() {
    return {
      set: Object,
      secondsUntilSet: Number,
      _countdownText: {
        type: String,
        computed: '_computeCountdownText(secondsUntilSet)'
      }
    };
  }

  _computeCountdownText(secondsUntilSet) {
    const minutes = Math.floor(secondsUntilSet / 60);
    const seconds = secondsUntilSet % 60;
    return minutes.toString() + ':' + seconds.toString().padStart(2, '0');
  }
}

window.customElements.define('ui-waiting', UiWaiting);
