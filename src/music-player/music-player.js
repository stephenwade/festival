import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';
import '@polymer/polymer/lib/elements/dom-if.js';

/**
 * @customElement
 * @polymer
 */
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
      <template is="dom-if" id="if">
        Playing music
      </template>
    `;
  }

  play() {
    this.shadowRoot.getElementById('if').if = true;
  }
}

window.customElements.define('music-player', MusicPlayer);
