import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';
import { connect } from 'pwa-helpers/connect-mixin.js';
import moment from 'moment/src/moment.js';

import { store } from '../store.js';
import { setTargetShowStatus } from '../actions/targetShowStatus.js';
import './festival-clock.js';

export class FestivalCoordinator extends connect(store)(PolymerElement) {
  static get template() {
    return html`
      <festival-clock id="clock" on-clock-tick="_tick"></festival-clock>
    `;
  }

  static get properties() {
    return {
      setsData: {
        type: Object,
        observer: '_setsDataChanged',
      },
    };
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    this.$.clock.stopTicking();
  }

  stateChanged(state) {
    this.setsData = state.setsData;
  }

  updateSetMetadata(detail) {
    const sets = this.setsData.sets;
    for (const set of sets) {
      if (set === detail.set) {
        set.length = detail.duration;
        set.endMoment = set.startMoment.clone().add(set.length, 'seconds');
      }
    }
  }

  _setsDataChanged(setsData) {
    this.$.clock.stopTicking();
    if (setsData.sets) {
      this._setInitialTargetShowStatus();
      this.$.clock.startTicking();
    }
  }

  _tick() {
    const now = moment();
    this._updateTargetShowStatus(now);
  }

  _getInitialSet(now) {
    const sets = this.setsData.sets;
    for (const set of sets) {
      if (now.isBefore(set.endMoment)) return set;
    }
    return null;
  }

  _getNextSet(set) {
    const sets = this.setsData.sets;
    const setIdx = sets.indexOf(set);
    const nextSetIdx = setIdx + 1;
    if (nextSetIdx < sets.length) return sets[nextSetIdx];
    return null;
  }

  _getTargetShowStatusForSet(set, now) {
    if (set) {
      const nextSet = this._getNextSet(set);

      if (now.isBefore(set.startMoment)) {
        const secondsUntilSetFrac = set.startMoment.diff(
          now,
          'seconds',
          true /* do not truncate */
        );
        const secondsUntilSet = Math.ceil(secondsUntilSetFrac);
        return {
          set,
          secondsUntilSet,
          status: 'WAITING_UNTIL_START',
          nextSet,
        };
      }

      const currentTimeFrac = now.diff(
        set.startMoment,
        'seconds',
        true /* do not truncate */
      );
      const currentTime = Math.floor(currentTimeFrac);
      return {
        set,
        currentTime,
        status: 'PLAYING',
        nextSet,
      };
    }

    return {
      set: null,
      status: 'ENDED',
    };
  }

  _setInitialTargetShowStatus() {
    const now = moment();
    const initialSet = this._getInitialSet(now);

    const newTargetShowStatus = this._getTargetShowStatusForSet(
      initialSet,
      now
    );
    store.dispatch(setTargetShowStatus(newTargetShowStatus));
  }

  _updateTargetShowStatus(now) {
    const { targetShowStatus } = store.getState();

    if (targetShowStatus.status === 'ENDED') {
      this.$.clock.stopTicking();
      return;
    }

    let set = targetShowStatus.set;
    // make sure next set event is ready before current set ends
    const setCutoff = set.endMoment.clone().subtract(1, 'second');
    if (now.isAfter(setCutoff)) set = this._getNextSet(set);

    const newTargetShowStatus = this._getTargetShowStatusForSet(set, now);
    store.dispatch(setTargetShowStatus(newTargetShowStatus));
  }
}

window.customElements.define('festival-coordinator', FestivalCoordinator);
