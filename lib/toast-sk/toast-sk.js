/* eslint-disable */

// toast-sk from elements-sk version 4.1.0
// modified to use CSS instead of SCSS

/**
 * @module elements-sk/toast-sk
 * @description <h2><code>toast-sk</code></h2>
 *
 * <p>
 *   Notification toast that pops up from the bottom of the screen
 *   when shown.
 * </p>
 *
 * @attr duration - The duration, in ms, to display the notification.
 *               Defaults to 5000. A value of 0 means to display
 *               forever.
 */
import { LitElement, html, css } from 'lit-element';
import { define } from './define';
import { upgradeProperty } from './upgradeProperty';
export class ToastSk extends LitElement {
  static get styles() {
    return css`
      :host {
        position: fixed;
        bottom: 0;
        left: 10px;
        z-index: 20;
        display: block;
        padding: 10px 15px;
        opacity: 0;
        visibility: hidden;
      }

      :host([shown]) {
        bottom: 10px;
        opacity: 1;
        visibility: visible;
        transition: bottom 0.3s linear, opacity 0.3s linear, visibility 0s;
      }
    `;
  }
  render() {
    return html`<slot></slot>`;
  }
  constructor() {
    super();
    this._timer = null;
  }
  connectedCallback() {
    super.connectedCallback();
    if (!this.hasAttribute('duration')) {
      this.duration = 5000;
    }
    upgradeProperty(this, 'duration');
  }
  /** Mirrors the duration attribute. */
  get duration() {
    return +(this.getAttribute('duration') || '');
  }
  set duration(val) {
    this.setAttribute('duration', val.toString());
  }
  /** Displays the contents of the toast. */
  show() {
    this.setAttribute('shown', '');
    if (this.duration > 0 && !this._timer) {
      this._timer = window.setTimeout(() => {
        this._timer = null;
        this.hide();
      }, this.duration);
    }
  }
  /** Hides the contents of the toast. */
  hide() {
    this.removeAttribute('shown');
    if (this._timer) {
      window.clearTimeout(this._timer);
      this._timer = null;
    }
  }
}
define('toast-sk', ToastSk);
