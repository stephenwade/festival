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
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
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

        #artist-group-outer {
          width: 2000px;
        }

        #artist-group {
          display: inline-block;
        }

        #artist-group.vertical {
          max-width: 100vw;
          padding: 0 1em;
        }

        #artist-group.vertical div {
          display: block;
          padding-left: 0;
          text-align: left;
        }

        #artist,
        #members {
          display: inline-block;
          vertical-align: top;
        }

        #artist {
          font-size: 3em;
          font-weight: 900;
          text-align: right;
          line-height: 0.9;
          letter-spacing: -0.05em;
          margin-bottom: -0.2rem;
        }

        #members {
          font-size: 1.3em;
          text-align: left;
          line-height: 1;
          padding-left: 0.6rem;
          padding-top: 0.25rem;
        }

        #members span {
          display: block;
        }
      </style>
      <div id="countdown">[[_countdownText]]</div>
      <div id="nextup">Next up</div>
      <div id="artist-group-outer">
        <div id="artist-group">
          <div id="artist">[[set.artist]]</div>
          <div id="members">
            <dom-repeat items="[[set.members]]" on-dom-change="_resizeText">
              <template>
                <span>[[item]]</span>
              </template>
            </dom-repeat>
          </div>
        </div>
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

  connectedCallback() {
    super.connectedCallback();

    this._resize = this._resizeText.bind(this);

    window.addEventListener('resize', this._resize);
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    window.removeEventListener('resize', this._resize);
  }

  _resizeText() {
    const artistGroup = this.$['artist-group'];

    artistGroup.classList.remove('vertical');
    const rect = artistGroup.getBoundingClientRect();
    const maxWidth = window.innerWidth;
    if (rect.width > maxWidth) artistGroup.classList.add('vertical');
  }

  _computeCountdownText(secondsUntilSet) {
    const minutes = Math.floor(secondsUntilSet / 60);
    const seconds = secondsUntilSet % 60;
    return minutes.toString() + ':' + seconds.toString().padStart(2, '0');
  }
}

window.customElements.define('ui-waiting', UiWaiting);
