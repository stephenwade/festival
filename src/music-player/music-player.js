import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';

/**
 * @customElement
 * @polymer
 */
export class MusicPlayer extends PolymerElement {
  static get template() {
    return html`
      <style>
        :host {
          color: white;
          font-size: 40px;
        }
      </style>
      Playing music
    `;
  }
}

window.customElements.define('music-player', MusicPlayer);
