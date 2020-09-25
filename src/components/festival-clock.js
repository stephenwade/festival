import { connect } from 'pwa-helpers/connect-mixin.js';
import {
  setDriftlessIntervalEverySecond,
  clearDriftless,
} from '../../lib/driftless/driftless.js';

import { store } from '../store.js';
import { tick } from '../actions/targetShowStatus.js';

export class FestivalClock extends connect(store)(HTMLElement) {
  disconnectedCallback() {
    super.disconnectedCallback();

    this._stopTicking();
  }

  stateChanged(state) {
    if (this._ticking !== state.clock.ticking) {
      this._ticking = state.clock.ticking;
      if (this._ticking) this._startTicking();
      if (!this._ticking) this._stopTicking();
    }
  }

  _startTicking() {
    FestivalClock._tick();
    this._tickInterval = setDriftlessIntervalEverySecond(FestivalClock._tick);
  }

  _stopTicking() {
    clearDriftless(this._tickInterval);
  }

  static _tick() {
    store.dispatch(tick());
  }
}

window.customElements.define('festival-clock', FestivalClock);
