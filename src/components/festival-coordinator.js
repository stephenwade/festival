import { PolymerElement } from '@polymer/polymer/polymer-element.js';
import { connect } from 'pwa-helpers/connect-mixin.js';
import {
  setDriftlessIntervalEverySecond,
  clearDriftless,
} from '../../lib/driftless/driftless.js';
import moment from 'moment/src/moment.js';

import { store } from '../store.js';
import { setTargetShowStatus } from '../actions/targetShowStatus.js';

export class FestivalCoordinator extends connect(store)(PolymerElement) {
  static get template() {
    return null;
  }

  static get properties() {
    return {
      setsData: {
        type: Object,
        observer: '_setsDataChanged',
      },
      targetAudioStatus: {
        type: Object,
        notify: true,
      },
    };
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    this._clearTimer();
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
    this._clearTimer();
    if (setsData.sets) {
      this._setInitialTargetAudioStatus();
      this._setupTimer();
    }
  }

  _setupTimer() {
    this._tick();
    this._tickInterval = setDriftlessIntervalEverySecond(this._tick.bind(this));
  }

  _clearTimer() {
    clearDriftless(this._tickInterval);
  }

  _tick() {
    const now = moment();
    this._updateTargetShowStatus(now);
    this._updateTargetAudioStatus(now);
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

  _getTargetAudioStatusForSet(set, now) {
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

  _setInitialTargetAudioStatus() {
    const now = moment();
    const currentSet = this._getInitialSet(now);

    this.targetAudioStatus = this._getTargetAudioStatusForSet(currentSet, now);
  }

  _updateTargetAudioStatus(now) {
    if (this.targetAudioStatus.status === 'ENDED') {
      this._clearTimer();
      return;
    }

    let set = this.targetAudioStatus.set;
    // make sure next set event is ready before current set ends
    const setCutoff = set.endMoment.clone().subtract(1, 'second');
    if (now.isAfter(setCutoff)) set = this._getNextSet(set);

    this.targetAudioStatus = this._getTargetAudioStatusForSet(set, now);
  }

  _updateTargetShowStatus(now) {
    const sets = this.setsData.sets;

    switch (store.getState().targetShowStatus) {
      case 'WAITING_UNTIL_START': {
        const firstSet = sets[0];
        if (firstSet && now.isSameOrAfter(firstSet.startMoment)) {
          store.dispatch(setTargetShowStatus('IN_PROGRESS'));
        } else break;
      }
      // fallthrough
      case 'IN_PROGRESS': {
        const lastSet = sets.slice(-1)[0];
        if (lastSet && now.isAfter(lastSet.endMoment)) {
          store.dispatch(setTargetShowStatus('ENDED'));
        } else break;
      }
      // fallthrough
      case 'ENDED':
        break;

      default:
        throw new Error('Unknown status');
    }
  }
}

window.customElements.define('festival-coordinator', FestivalCoordinator);
