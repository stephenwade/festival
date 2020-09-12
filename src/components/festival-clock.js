import {
  setDriftlessIntervalEverySecond,
  clearDriftless,
} from '../../lib/driftless/driftless.js';

export class FestivalClock extends HTMLElement {
  disconnectedCallback() {
    super.disconnectedCallback();

    this.stopTicking();
  }

  startTicking() {
    this._tick();
    this._tickInterval = setDriftlessIntervalEverySecond(this._tick.bind(this));
  }

  stopTicking() {
    clearDriftless(this._tickInterval);
  }

  _tick() {
    this.dispatchEvent(
      new CustomEvent('clock-tick', {
        bubbles: true,
        composed: true,
      })
    );
  }
}

window.customElements.define('festival-clock', FestivalClock);
