import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';
import '@polymer/polymer/lib/elements/dom-if.js';

export class MusicPlayer extends PolymerElement {
  ready() {
    super.ready();
  }

  static get template() {
    return html`
      <style>
        :host {
          font-size: 40px;
        }
      </style>
      <template is="dom-if" id="if-queued">
        Queued…
      </template>
      <template is="dom-if" id="if-play">
        Playing music
      </template>
    `;
  }

  queue() {
    this.shadowRoot.getElementById('if-queued').if = true;
    setTimeout(() => {
      this.shadowRoot.getElementById('if-queued').if = false;
    }, 1000);
  }

  play() {
    this.shadowRoot.getElementById('if-play').if = true;
  }
}

window.customElements.define('music-player', MusicPlayer);
