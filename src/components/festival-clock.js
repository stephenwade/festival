import { connect } from 'pwa-helpers/connect-mixin.js';
import {
  setDriftlessIntervalEverySecond,
  clearDriftless,
} from '../../lib/driftless/driftless.js';

import { store } from '../store.js';
import { tick } from '../actions/targetShowStatus.js';

class FestivalClock extends connect(store)(HTMLElement) {
  disconnectedCallback() {
    this._stopTicking();

    super.disconnectedCallback();
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

customElements.define('festival-clock', FestivalClock);
